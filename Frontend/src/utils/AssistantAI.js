let speaking = false;

export function speak(text){

if(!("speechSynthesis" in window))
return;

speechSynthesis.cancel();

const utterance =
new SpeechSynthesisUtterance(text);

utterance.rate=0.95;

utterance.lang="en-US";

utterance.onend=()=>{

speaking=false;

};

speaking=true;

speechSynthesis.speak(utterance);

}


export function getInstruction(letter){

const instructions={

A:"Make a fist and keep thumb outside.",

B:"Keep fingers straight together.",

C:"Curve hand like holding an orange.",

D:"Point index finger upward.",

L:"Make L shape using thumb and index.",

V:"Raise two fingers apart.",

W:"Raise three fingers.",

I:"Raise pinky finger.",

Y:"Raise thumb and pinky."

};

return instructions[letter]
|| "Follow finger placement carefully.";

}



export function compliment(){

const list=[

"Excellent work!",

"Perfect sign!",

"Great job!",

"That was accurate!"

];

return list[
Math.floor(Math.random()*list.length)
];

}



export function retryMessage(){

const list=[

"Almost there.",

"Try adjusting fingers.",

"Keep trying.",

"Not correct yet."

];

return list[
Math.floor(Math.random()*list.length)
];

}