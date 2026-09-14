// Night Shift editorial layer, project filters, signal readout, deep links.
// Split from the original single-file index.html on 2026-09-13; classic script, shares the global scope
// with every other js/*.js file. Load order is the numeric prefix.
function updateExperienceMode(isInside){
  document.body.classList.toggle('in-shop', isInside);
  const readout = document.querySelector('.signal-readout strong');
  if(readout) readout.textContent = isInside ? 'Counter / Course 02' : 'Seattle / Rain 01';
}
function startNightShift(panel){
  if(!inside){
    enterShop();
    setTimeout(()=>openPanel(panel), 780);
  } else {
    openPanel(panel);
  }
}
window.startNightShift=startNightShift;
function filterProjects(track, trigger){
  document.querySelectorAll('.project-entry[data-track]').forEach((card, index)=>{
    const show = track === 'all' || card.dataset.track === track;
    card.classList.toggle('is-filtered', !show);
    if(show){
      card.animate([{opacity:0, transform:'translateY(7px)'},{opacity:1, transform:'translateY(0)'}], {duration:260, delay:index*28, easing:'cubic-bezier(.22,1,.36,1)'});
    }
  });
  document.querySelectorAll('.case-filter').forEach(button=>button.classList.toggle('active', button===trigger));
  srAnnounce(track === 'all' ? 'Showing all projects' : 'Showing ' + track + ' projects');
}
window.filterProjects=filterProjects;

// Micro-interaction: rotate the environmental readout as a quiet live signal.
const _signalPhrases=['Seattle / Rain 01','Systems / Service 02','Signal / Story 03'];
let _signalIndex=0;
setInterval(()=>{
  if(inside) return;
  const readout=document.querySelector('.signal-readout strong');
  if(!readout) return;
  _signalIndex=(_signalIndex+1)%_signalPhrases.length;
  readout.animate([{opacity:.2,transform:'translateY(3px)'},{opacity:1,transform:'translateY(0)'}],{duration:360,easing:'ease-out'});
  readout.textContent=_signalPhrases[_signalIndex];
},5200);

// Shareable deep links: /#projects, /#experience, /#skills, or /#contact.
const _deepPanel = location.hash.slice(1).toLowerCase();
if(['projects','experience','skills','contact'].includes(_deepPanel)){
  setTimeout(()=>startNightShift(_deepPanel), 2850);
}
