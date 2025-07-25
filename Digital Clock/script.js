const currentTime = () => {
  let curTime = new Date().toLocaleTimeString();
  document.getElementById("clock").innerText = curTime;
};
currentTime();

// isse continuously se chlta rhega :- start here
setInterval(() => {
  currentTime();
}, 1000);
// end here

// isse after kitna der ke baad stop krna chahte ho :-  Start here
// const intervalid = setInterval(() => {
//   currentTime();
// }, 1000);
// setTimeout(() => clearInterval(intervalid), 5000);
//end here
