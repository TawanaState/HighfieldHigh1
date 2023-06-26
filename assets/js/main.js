/**
 * Easy selector helper function
 */
const select = (el, all = false) => {
  el = el.trim();
  if (all) {
    return [...document.querySelectorAll(el)];
  } else {
    return document.querySelector(el);
  }
};

/**
 * Easy event listener function
 */
const on = (type, el, listener, all = false) => {
  let selectEl = select(el, all);
  if (selectEl) {
    if (all) {
      selectEl.forEach((e) => e.addEventListener(type, listener));
    } else {
      selectEl.addEventListener(type, listener);
    }
  }
};

/**
 * Easy on scroll event listener
 */
const onscroll = (el, listener) => {
  el.addEventListener("scroll", listener);
};
/**
 * Scrolls to an element with header offset
 */
const scrollto = (el) => {
  let header = select("#header");
  let offset = header.offsetHeight;

  if (!header.classList.contains("header-scrolled")) {
    offset -= 16;
  }

  let elementPos = select(el).offsetTop;
  window.scrollTo({
    top: elementPos - offset,
    behavior: "smooth",
  });
};

on(
  "click",
  ".toggle-btn",
  (event) => {
    event.target.parentElement.classList.toggle("active");
  },
  true
);

function showImage(evt) {
  var files = evt.target.files;
  if (files.length === 0) {
    console.log("No files selected");
    return;
  }

  console.log(files);

  for (let index = 0; index < files.length; index++) {
    const v = files[index];
    let reader = new FileReader();

    reader.onload = function (event) {
      let img = new Image();
      img.onload = function () {
        select('.images').appendChild(img);
      };
      img.ondblclick = function(event){
        console.log('db');
        event.target.remove();
      }
      img.src = event.target.result;
    };
    reader.readAsDataURL(v);
  }
  
}


on(
  "click",
  "footer .images>img",
  (event) => {
    select(".gallery > img").src = event.target.src;
    select(".gallery").classList.toggle("active");
  },
  true
);


function notify(msg, classes = ["text-white"], container = document.querySelector('html')) {
  let ts = document.createElement("div");
  ts.classList.add("toaster");
  let pr = document.createElement("p");
  pr.innerHTML = msg;
  pr.classList.add(classes);
  ts.appendChild(pr);
  container.appendChild(ts);
  window.setTimeout(() => {
    container.removeChild(ts);
  }, 8 * 1000);
}

places.forEach((v, k, p) => {
  let op = document.createElement('option');
  op.value = v.title;
  op.setAttribute('type', 'Place');
  op.innerText = 'Place';
  select('datalist#Places').appendChild(op);
});
