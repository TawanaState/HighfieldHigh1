try {
    importScripts('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@3.8.0/dist/tf.min.js');
    importScripts('https://cdn.jsdelivr.net/npm/@tensorflow-models/qna');
} catch (error) {
    self.postMessage({start : false});
    console.error(error);
}


try {
    // Load the Q&A model
    qna.load().then(model => {
    // Save the model in the worker's context
    self.qnaModel = model;
    self.postMessage({start : true});
    });
} catch (error) {
    self.postMessage({start : false});
    console.error(error);
}



async function answerQuestion(question, context) {
    // Use the Q&A model to answer the question
    const answers = await self.qnaModel.findAnswers(question, context);
  
    // Return the top answer
    return answers[0];
}
self.onmessage = async (event) => {
    // Extract the question and context from the message
    const { question, context } = event.data;
  
    // Perform question answering
    const answer = await answerQuestion(question, context);
  
    // Send the answer back to the main thread
    self.postMessage({ answer });
};
