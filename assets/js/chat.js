var db = new Dexie('MyChats');
db.version(1).stores({
    chats : '++id, me, content, data'
});
select('.chats').innerHTML = '';
db.chats.each(item => {
    addMessage(item.content, item.data, item.me);
});

user = {displayName : 'State'};
let model;
let suggestions = [
    'Hi',
    'Thank you',
    'Where is the University of Zimbabwe',
    'When was the University of Zibabwe built?',
]
suggestions.forEach((v, k, p) => {
    let sug = document.createElement('span');
    sug.innerText = v;
    select('.suggestions').appendChild(sug);
})

let QNA = [];
try {
    QNA = [
        {
            q : ['thanks', 'thanx', 'thank you', 'great'],
            a : ['You are welcome. ', 'My Pleasure :)', 'Glad I could help. ']
        },
        {
            q : ['bye', 'see you', 'see ya'],
            a : ['Bye bye', 'come back soon (:']
        },
        {
            q : ['what is your name', 'tell me your name', 'who are you', 'what do you do'],
            a : ['Im a robot with currently no name. Created to help visitors of the University of Zimbabwe. ']
        },
        {
            q:['who made you', 'who is your maker', 'who developed you'],
            a : ['The developer is Tawananyashsa Mukoriwo and the Project manager is Sean Kaguramamba. ']
        },
        {
            q : ['hi', 'hello', 'hey there', 'hey', 'good morning', 'good afternoon', 'good evening'],
            a : ['Hey there ' + user.displayName, 'Watup ' + user.displayName, 'Hello ' + user.displayName, 'Hi '+ user.displayName, 'Hey ' + user.displayName]
        }
    ];
} catch (error) {
    notify(error);
}


const worker = new Worker('assets/js/ww.js');
// Add listener for when the worker replies
worker.addEventListener('message', (event) => {
  console.log('Worker said: ', event.data);

  if(event.data.start == true){
    select('body').classList.add('active');
    select('.loader').remove();
  }else if(event.data.start == false){
    setchatState("offline");
    notify('Qna model could not load.', 'text-danger');
    select('.loader > span').innerText = 'Failed to load. ';
    select('.loader > .spinner-border').style.animationIterationCount = 1;
  }else{
    addMessage(event.data.text, `Accuracy : ${Math.round(event.data.score * 100)}%`, false);
    setchatState('online');
  }

});



function setchatState(text){
    select('#chat_state').innerText = text;
}

document.querySelector('input').addEventListener('keyup', (event) => {
    select('.suggestions > span', true).forEach((v, k, p) => {
        if(!v.innerText.toLowerCase().includes(select('input').value.toLowerCase())){
            v.classList.add('d-none');
        } else{
            v.classList.remove('d-none');
        }
    })
});


function addMessage(text, data, me=true) {
    let msg = document.createElement('div');
    msg.classList.add('msg');
    msg.innerHTML = `<span>
    <p>
        ${text}
    </p><i>${data}</i></span>`;
    if(me){
        msg.classList.add('me');
    }
    select('.chats').appendChild(msg);
    scrollToBottom();
    db.chats.put({
        date : (new Date),
        me : me,
        content : text,
        data : data
    });
}

async function sendMessage(msg = select('input').value) {
    // Finding the answers
    addMessage(msg, (new Date).toLocaleString());
    try {
        setchatState('typing...');
        // Send data to worker
        worker.postMessage({context : window.MY_PASSAGES_DATASET, question : msg});
    } catch (error) {
        notify(error, 'text-danger');
    }
    
    
}


on('click', '.suggestions > span',(event) => {
    select('input').value = event.target.innerText;
}, true);

function FormbtnClick(event) {
    if (event.target.querySelector('button i.bi.bi-mic') !== null){
        //startRecog();
        event.target.querySelector('button i.bi.bi-mic').classList.add('text-danger');
    }else{
        if(!response(select('input').value)){
            sendMessage();
            select('input').value = "";
        }
        
    }
}

function scrollToBottom() {
    select('.chats').scroll(0, document.querySelector('.chats').scrollHeight);
}
scrollToBottom();

function response(qsn){
    let qsns = [];
    QNA.forEach((v, k, p) => {
        let rating = stringSimilarity.findBestMatch(qsn.toLowerCase(), v.q);
        qsns.push(rating.bestMatch);
    });
    qsns = qsns.sort((a, b) => {
        return b.rating - a.rating; 
    });
    console.log(qsns[0]);
    if(qsns[0].rating > 0.5){
        let dd = QNA.filter(v => v.q.includes(qsns[0].target));
        addMessage(qsn, (new Date).toLocaleString());
        select('input').value = '';
        addMessage(randomPick(dd[0].a), '', false);
        return true;
    } else{
        return false;
    }
}

function randomPick(arr) {
    const randomIndex = Math.floor(Math.random() * arr.length);
    const item = arr[randomIndex];
    return item;
}

function clearMsgs(param) {
    db.chats.clear();
    select('.chats').innerHTML = '';
}
