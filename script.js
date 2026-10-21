(() => {
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const pages = $$('.page');
  const navItems = $$('.nav-item');
  const popup = $('#explorePopup');
  const activityOverlay = $('#activityOverlay');
  const activityContent = $('#activityContent');
  const toast = $('#toast');
  let lastFocus = null;
  let quizIndex = 0;
  let quizScore = 0;
  let factIndex = 0;
  let missionChecks = new Set();

  const accents = {
    home:'#f4b942', science:'#7caeff', tech:'#5de0e8',
    innovation:'#ffbd4a', sustainability:'#8bdc9b', future:'#b7a0ff', contact:'#f4b942'
  };

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove('show'), 2600);
  }

  function goToPage(name, updateHash=true) {
    if (!pages.some(p => p.dataset.page === name)) name = 'home';
    pages.forEach(p => p.classList.toggle('active', p.dataset.page === name));
    navItems.forEach(item => {
      const active = item.dataset.pageLink === name;
      item.classList.toggle('active', active);
      item.setAttribute('aria-current', active ? 'page' : 'false');
    });
    document.documentElement.style.setProperty('--page-accent', accents[name] || accents.home);
    if (updateHash && location.hash !== '#' + name) history.replaceState(null, '', '#' + name);
    $('#menuToggle').setAttribute('aria-expanded', 'false');
    $('#bottomNav').classList.remove('menu-open');
    window.scrollTo({top:0, behavior:'smooth'});
  }

  $$('[data-page-link]').forEach(el => el.addEventListener('click', e => {
    e.preventDefault();
    closePopup();
    closeActivity();
    goToPage(el.dataset.pageLink);
  }));

  function openPopup() {
    lastFocus = document.activeElement;
    popup.classList.add('is-open');
    popup.setAttribute('aria-hidden','false');
    document.body.style.overflow='hidden';
    $('#closePopup').focus();
  }
  function closePopup() {
    popup.classList.remove('is-open');
    popup.setAttribute('aria-hidden','true');
    if (!activityOverlay.classList.contains('is-open')) document.body.style.overflow='';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  $('#exploreButton').addEventListener('click', openPopup);
  $('#closePopup').addEventListener('click', closePopup);
  popup.addEventListener('click', e => { if (e.target === popup) closePopup(); });

  function openActivity() {
    activityOverlay.classList.add('is-open');
    activityOverlay.setAttribute('aria-hidden','false');
    document.body.style.overflow='hidden';
    $('#closeActivity').focus();
  }
  function closeActivity() {
    activityOverlay.classList.remove('is-open');
    activityOverlay.setAttribute('aria-hidden','true');
    if (!popup.classList.contains('is-open')) document.body.style.overflow='';
  }
  $('#closeActivity').addEventListener('click', closeActivity);
  activityOverlay.addEventListener('click', e => { if (e.target === activityOverlay) closeActivity(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (activityOverlay.classList.contains('is-open')) closeActivity();
      else if (popup.classList.contains('is-open')) closePopup();
    }
  });

  const quizQuestions = [
    {q:'Which planet is known as the Red Planet?',a:['Venus','Mars','Jupiter','Mercury'],correct:1,why:'Mars looks reddish because iron-rich dust covers much of its surface.'},
    {q:'Which of these is a renewable energy source?',a:['Coal','Natural gas','Solar power','Petrol'],correct:2,why:'Solar power uses energy from sunlight, which is naturally replenished.'},
    {q:'What does AI stand for?',a:['Automated Internet','Artificial Intelligence','Advanced Input','Applied Information'],correct:1,why:'Artificial intelligence describes computer systems designed to perform tasks that usually require human-like intelligence.'},
    {q:'Which action helps reduce waste?',a:['Use single-use items once','Throw everything together','Reuse items when possible','Leave lights on'],correct:2,why:'Reusing items can reduce the resources and energy needed to make new products.'},
    {q:'What is the closest star to Earth?',a:['Sirius','The Sun','Polaris','Proxima Centauri'],correct:1,why:'The Sun is our nearest star and the main source of energy for life on Earth.'}
  ];
  const facts = [
    'A day on Venus is longer than its year: Venus rotates very slowly compared with how long it takes to orbit the Sun.',
    'Octopuses have three hearts. Two move blood through the gills, while one moves it to the rest of the body.',
    'The Sun contains the vast majority of the mass in our solar system—far more than all the planets combined.',
    'Some bamboo species can grow very quickly under the right conditions, though growth rates vary by species and environment.',
    'Your brain uses electrical and chemical signals to communicate between billions of nerve cells.',
    'Earth is not a perfect sphere: its rotation makes it slightly wider around the equator.'
  ];
  const missions = [
    'Carry a reusable bottle or bag today.',
    'Switch off lights and devices when they are not needed.',
    'Check a tap for drips and avoid wasting water.',
    'Separate recyclable waste where local facilities allow it.',
    'Spend 10 minutes picking up litter safely with adult guidance if needed.',
    'Choose walking, cycling, or public transport for a suitable short trip.',
    'Share one practical eco-friendly idea with someone.'
  ];

  function showActivity(title, eyebrow, html) {
    activityContent.innerHTML = `<span class="activity-eyebrow">${eyebrow}</span><h2 id="activityTitle">${title}</h2>${html}`;
    openActivity();
  }
  function startQuiz() {
    quizIndex = 0; quizScore = 0; renderQuiz();
  }
  function renderQuiz(feedback='') {
    const item = quizQuestions[quizIndex];
    if (!item) {
      showActivity('Quiz complete!', 'QUICK QUIZ', `<div class="fact-display">You scored ${quizScore} out of ${quizQuestions.length}. ${quizScore===quizQuestions.length?'Brilliant work, future thinker!':'Every question is a chance to learn. Try again and beat your score!'}</div><div class="activity-actions"><button class="btn btn-primary" id="quizAgain">Try again ↻</button><button class="btn btn-dark" id="quizDone">Done</button></div>`);
      $('#quizAgain').addEventListener('click', startQuiz); $('#quizDone').addEventListener('click', closeActivity); return;
    }
    showActivity('Test your spark', `QUESTION ${quizIndex+1} OF ${quizQuestions.length}`, `<p class="activity-question">${item.q}</p><div class="answer-list">${item.a.map((a,i)=>`<button class="answer-option" data-answer="${i}">${String.fromCharCode(65+i)}. ${a}</button>`).join('')}</div><div id="quizFeedback" class="activity-feedback" ${feedback?'':'hidden'}>${feedback}</div><div class="activity-actions"><button class="btn btn-primary" id="quizNext" disabled>${quizIndex===quizQuestions.length-1?'See score':'Next question'} →</button></div>`);
    let answered = false;
    $$('[data-answer]', activityContent).forEach(btn => btn.addEventListener('click', () => {
      if (answered) return; answered = true;
      const chosen = Number(btn.dataset.answer);
      const correct = chosen === item.correct;
      if (correct) quizScore++;
      $$('[data-answer]', activityContent).forEach((option,i) => {
        option.disabled = true;
        if (i === item.correct) option.classList.add('correct');
        else if (i === chosen) option.classList.add('wrong');
      });
      const fb = $('#quizFeedback'); fb.hidden = false; fb.textContent = (correct?'Correct! ':'Not quite. ') + item.why;
      $('#quizNext').disabled = false;
    }));
    $('#quizNext').addEventListener('click', () => { quizIndex++; renderQuiz(); });
  }
  function showFact() {
    const fact = facts[factIndex % facts.length];
    showActivity('Did You Know?', `FACT ${factIndex+1} OF ${facts.length}`, `<div class="fact-display">💡 ${fact}</div><div class="activity-actions"><button class="btn btn-primary" id="nextFact">Another fact ↗</button><button class="btn btn-dark" id="factDone">Done</button></div>`);
    $('#nextFact').addEventListener('click', () => { factIndex = (factIndex+1)%facts.length; showFact(); });
    $('#factDone').addEventListener('click', closeActivity);
  }
  function showMission() {
    showActivity('Your 7-Day Green Mission', 'MAKE A DIFFERENCE', `<p class="lead" style="margin:10px 0">Tick off each small action as you complete it. Progress stays only in this page session.</p><div class="mission-list">${missions.map((m,i)=>`<label class="mission-item"><input type="checkbox" data-mission="${i}" ${missionChecks.has(i)?'checked':''}><span><strong>Day ${i+1}</strong><br>${m}</span></label>`).join('')}</div><p class="mission-progress" id="missionProgress"></p><div class="activity-actions"><button class="btn btn-primary" id="missionDone">Keep going 🌱</button></div>`);
    const update = () => { const count = $$('[data-mission]:checked',activityContent).length; $('#missionProgress').textContent = `${count} of 7 missions completed`; };
    $$('[data-mission]',activityContent).forEach(cb=>cb.addEventListener('change',()=>{const i=Number(cb.dataset.mission);cb.checked?missionChecks.add(i):missionChecks.delete(i);update();}));
    update(); $('#missionDone').addEventListener('click',()=>{closeActivity();showToast('Every small action counts. Keep your green spark alive! 🌱');});
  }
  function showChallenge() {
    showActivity('Future Challenge', 'IMAGINE • SOLVE • INNOVATE', `<p class="activity-question">Your town produces too much single-use plastic. Imagine you can create one new idea to reduce it. What would you build or change?</p><textarea class="challenge-input" id="challengeAnswer" placeholder="My idea is..."></textarea><div class="activity-actions"><button class="btn btn-primary" id="saveIdea">Save my idea ✦</button><button class="btn btn-dark" id="challengeHint">Give me a hint</button></div><p class="form-status" id="ideaStatus" role="status"></p>`);
    $('#saveIdea').addEventListener('click',()=>{const val=$('#challengeAnswer').value.trim();$('#ideaStatus').textContent=val?'Great spark! Your idea is shown here for this session—keep developing it.':'Write one idea first, even if it is small.';});
    $('#challengeHint').addEventListener('click',()=>showToast('Hint: think about refill stations, rewards for reusable containers, or better sorting systems.'));
  }
  const activityHandlers = {quiz:startQuiz,facts:showFact,difference:showMission,challenge:showChallenge};
  $$('[data-activity]').forEach(btn=>btn.addEventListener('click',()=>{closePopup();activityHandlers[btn.dataset.activity]?.();}));

  const topicInfo = {
    space:['Space Mysteries','The universe is vast, and scientists are still learning how it works. Black holes are regions where gravity is so strong that nothing—not even light—can escape once it crosses the event horizon.','Question to explore: What would you want a space telescope to discover?'],
    body:['The Human Body','Your body is a connected system. The brain, heart, lungs, and other organs work together using electrical signals, hormones, and chemical processes.','Try this: notice how your breathing changes after gentle movement, then returns to normal.'],
    experiments:['Science in Action','A safe science investigation starts with a question, a prediction, a fair test, and careful observations. Always ask an adult before trying an unfamiliar experiment.','Mini investigation: Which material absorbs the most water? Compare small equal-sized pieces and record your observations.'],
    facts:['Mind-Blowing Science Facts',facts[0],'Keep asking “how do we know?”—that is one of the most useful scientific questions.'],
    ai:['AI, Simply Explained','Artificial intelligence is a broad field in which computer systems perform tasks such as recognising patterns, generating text, or making predictions. AI can make mistakes, so important answers should be checked.','Remember: AI is a tool, not a guarantee of truth.'],
    inventions:['Future Inventions','Robotics, assistive devices, clean-energy systems, and medical tools are already changing how people live. Future designs work best when they solve real human needs.','Think about it: which everyday task would you most like technology to make easier?'],
    create:['Create With Tech','Start small: make a simple webpage, design a digital poster, or build a tiny program that solves one clear problem. You learn by testing, improving, and trying again.','Starter challenge: write down one problem, one user, and one feature your tool should have.'],
    'responsible-ai':['AI: Power or Problem?','AI can support learning and creativity, but privacy, bias, accuracy, and human oversight matter. Avoid sharing sensitive personal information with tools you do not trust.','Ask before using AI: Is it accurate? Is it fair? Is it safe?'],
    'idea-lab':['Idea Lab','Innovation begins with noticing a need. List annoyances you encounter, choose one, and brainstorm many possible fixes before deciding which is practical.','Prompt: what would make your school, home, or neighbourhood work better?'],
    problems:['Solve a Real Problem','A useful solution starts with understanding who experiences the problem and why it happens. Ask questions, sketch ideas, and test a small version before building more.','Try it: choose one waste or water problem and write three possible solutions.'],
    'history-inventions':['Inventions That Changed the World','Many influential inventions developed over time through the work of many people. Their impact often came from making communication, transport, health, or everyday tasks easier.','Explore: which invention has most changed your daily routine, and why?'],
    invent:['Invent Your Own Future','A good invention does not need to be complicated. It should solve a clear problem, be safe to use, and work for the people who need it.','Sketch your idea, give it a name, and explain what problem it solves.'],
    planet:['Planet in Focus','Earth’s living systems are connected. Clean air and water, healthy soils, and biodiversity support people and wildlife. Pollution and habitat loss can put these systems under pressure.','Choose one local environmental issue and learn what is already being done about it.'],
    recycle:['Reduce, Reuse, Recycle','Start by reducing what you need, reusing items when practical, and recycling materials accepted by your local collection system. Recycling rules vary by location.','Quick action: before throwing an item away, ask whether it can be reused or repaired safely.'],
    plastic:['Say No to Plastic','Single-use plastics are designed for brief use and can become long-lasting waste when poorly managed. Reusable alternatives can help when they are practical and properly cleaned.','Try: carry a reusable bag or bottle when you can, and dispose of waste responsibly.'],
    'save-energy':['Save Water & Energy','Turn off unused lights, unplug devices when appropriate, fix dripping taps, and use water thoughtfully. Small actions help most when repeated consistently.','Choose one habit to practise for a week and notice how easy it becomes.'],
    'green-tech':['Green Innovations','Solar and wind power generate electricity with low operational emissions. Better batteries, efficient buildings, and cleaner transport can also help reduce environmental impact.','Think: what renewable energy could work well in your area?'],
    'space-life':['Life Beyond Earth','Scientists study Mars and distant worlds to understand whether environments could support life. So far, there is no confirmed evidence of life beyond Earth.','Imagine: what would a safe and sustainable research base on Mars need?'],
    'future-cities':['Cities of Tomorrow','Future cities may combine efficient public transport, green spaces, clean energy, and smarter ways to manage water and waste. The best designs also need to be accessible and affordable.','Design prompt: choose three features that would make a city healthier.'],
    breakthroughs:['The Next Big Breakthroughs','Research in medicine, energy, materials, robotics, and communications may lead to important advances. Predictions are uncertain, and progress depends on evidence, safety, and real-world needs.','Question: which problem would you like future researchers to solve?'],
    'year-2050':['Imagine the Year 2050','No one knows exactly what life will be like in 2050. We can imagine possibilities based on current research, but these are scenarios—not promises.','Write a short description of one helpful technology you hope exists by 2050.']
  };
  function openTopic(key) {
    const info = topicInfo[key];
    if (!info) return;
    showActivity(info[0], 'FUTURE SPARK EXPLORER', `<p class="lead" style="margin:16px 0">${info[1]}</p><div class="fact-display">${info[2]}</div><div class="activity-actions"><button class="btn btn-primary" id="topicBack">Keep exploring ↗</button><button class="btn btn-dark" id="topicClose">Close</button></div>`);
    $('#topicBack').addEventListener('click',closeActivity); $('#topicClose').addEventListener('click',closeActivity);
  }
  $$('[data-topic]').forEach(btn=>btn.addEventListener('click',()=>openTopic(btn.dataset.topic)));

  $$('[data-action]').forEach(btn=>btn.addEventListener('click',()=>{
    const action=btn.dataset.action;
    if(action==='green-mission') showMission();
    else if(action==='science-mystery') showActivity('Mystery of the Day','MAKE A GUESS','<p class="activity-question">Which planet has the hottest average surface temperature in our solar system?</p><div class="answer-list"><button class="answer-option" data-mystery="0">Mercury</button><button class="answer-option" data-mystery="1">Venus</button><button class="answer-option" data-mystery="2">Mars</button></div><div class="activity-feedback" id="mysteryFeedback" hidden></div>');
    else if(action==='human-ai') showActivity('Human vs AI Challenge','THINK FIRST','<p class="activity-question">In one minute, list three ways to make learning more engaging without using more screen time.</p><textarea class="challenge-input" id="humanAnswer" placeholder="My three ideas..."></textarea><div class="activity-actions"><button class="btn btn-primary" id="humanHint">Show inspiration</button></div><p id="humanHintText" class="activity-feedback" hidden>Try peer teaching, hands-on experiments, learning games, outdoor observation, or short creative projects.</p>');
    else if(action==='three-ideas') showActivity('One Problem, Three Ideas','IDEA LAB','<p class="activity-question">Choose a problem around you and write three possible solutions. Wild ideas are welcome—then decide which is easiest to test.</p><textarea class="challenge-input" placeholder="Problem: ...&#10;Idea 1: ...&#10;Idea 2: ...&#10;Idea 3: ..."></textarea><div class="activity-actions"><button class="btn btn-primary" id="ideaDone">Done</button></div>');
    else if(action==='design-future') showActivity('Design the Future','CITY PLANNER 2050','<p class="activity-question">You are planning a city in 2050. Choose three features that would make it cleaner, safer, and more enjoyable.</p><textarea class="challenge-input" placeholder="My future city will have..."></textarea><div class="activity-actions"><button class="btn btn-primary" id="cityDone">Save my plan</button></div>');
    const done=$('#ideaDone'); if(done)done.addEventListener('click',closeActivity);
    const cityDone=$('#cityDone');if(cityDone)cityDone.addEventListener('click',()=>{closeActivity();showToast('Your future city starts with an idea! 🚀');});
    const hint=$('#humanHint');if(hint)hint.addEventListener('click',()=>{$('#humanHintText').hidden=false;});
    $$('[data-mystery]').forEach(option=>option.addEventListener('click',()=>{const fb=$('#mysteryFeedback');fb.hidden=false;fb.textContent=option.dataset.mystery==='1'?'Correct! Venus has a dense atmosphere that traps heat very effectively.':'Not quite! It is Venus, whose dense atmosphere traps heat. Try another mystery soon.';$$('[data-mystery]').forEach(o=>o.disabled=true);}));
  }));

  $('#menuToggle').addEventListener('click',()=>{
    const nav=$('#bottomNav');const open=nav.classList.toggle('menu-open');
    $('#menuToggle').setAttribute('aria-expanded',String(open));
    showToast(open?'Choose a hexagon below to explore.':'Navigation ready.');
    if(open) nav.scrollIntoView({behavior:'smooth',block:'end'});
  });

  $('#contactForm').addEventListener('submit',e=>{
    e.preventDefault();
    const name=$('#contactName').value.trim(), email=$('#contactEmail').value.trim(), topic=$('#contactTopic').value, message=$('#contactMessage').value.trim();
    const subject=encodeURIComponent(`Future Spark: ${topic}`);
    const body=encodeURIComponent(`Name: ${name}\nEmail: ${email}\nTopic: ${topic}\n\n${message}`);
    const status=$('#formStatus');
    status.textContent='Opening your email app if one is configured. This demo does not store your message.';
    window.location.href=`mailto:?subject=${subject}&body=${body}`;
  });

  window.addEventListener('hashchange',()=>goToPage(location.hash.slice(1)||'home',false));
  goToPage(location.hash.slice(1)||'home',false);
})();