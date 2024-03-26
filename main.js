let scenario = [];
let scenarioLV2=[]
let altezzaAereo=[];  //vettore che si utilizza per dare un punteggio alla fine
let x_scenario
let y_scenario
let aereo
let index = 0; // indice per tenere traccia dell'immagine corrente
let alpha = 255; // opacità iniziale
let zoom = 1; // fattore di zoom iniziale
let zooming = true; // stato dello zoom
let lastChange = 0; // variabile per il tempo dedicata alla funzione checkDelay
let aereoY;
let pixelRead = false; // Variabile per tenere traccia se la lettura del pixel è già stata eseguita
let lastIndex = -1; // Variabile per tenere traccia dell'ultimo indice
let offsetYInizio=0
let inizio=true; //cambiare a false se si vuole subito il game play
let fade = 0; // Variabile per la dissolvenza
let movementSpeed=4
let statoGame=0 //gestisce la pausa del gioco
let cont=0  //gestisce il punto del gioco
let statoCollisione=0
let livello=0
let y_scenario_inzioFine=0
// let mySound

//funzione che disegna la minimappa e verifica le collisioni
function drawMap(x, y, posizioneX, cont, valZoom, valZoomMax) {
  statoCollisione=0
  let imgIngrandita = map.get();
  imgIngrandita.resize(map.width*1.5 , map.height*1.5);

  let pxForScene = imgIngrandita.height / 20;
  let offsetY=valZoom*(pxForScene*1.2)/valZoomMax
  let posY = ((imgIngrandita.height - cont * pxForScene) - 9.2*pxForScene)-offsetY; // Inverti il senso di scorrimento delle y
  //let posY = (imgIngrandita.height + cont * pxForScene) -13*pxForScene; // Inverti il senso di scorrimento delle y
  let posX = posizioneX * imgIngrandita.width / 4000 -30; // Aggiungere eventuale offset
  //let posX = posizioneX * imgIngrandita.width / 4000 ; // Aggiungere eventuale offset
  let porzione = imgIngrandita.get(posX, posY,100, 50);
  // Mostra la porzione dell'immagine sul canvas, specificando la posizione e le dimensioni
  
  image(porzione, x, y, 350, 220);



  // Coordinate dei punti iniziale e finale della linea
  
  stroke(0); // Colore del tratto nero
  // strokeWeight(5); // Imposta lo spessore della linea
  // //line(0, 215, width, 215); // Disegna una linea dall'angolo in alto a sinistra (0, y) all'angolo in alto a destra (width, y)
  // line(x+180, 0, x+180, height); // Disegna una linea dall'angolo in alto a sinistra (x, 0) all'angolo in basso a sinistra (x, height)
  // line(0, 160, width, 160); // Disegna una linea dall'angolo in alto a sinistra (0, y) all'angolo in alto a destra (width, y)



  // Controlla se l'immagine è cambiata rispetto all'ultima iterazione
  if (lastIndex !== index&&valZoom>(valZoomMax-0.1)) {
    
    // L'immagine è cambiata, esegui la lettura solo se non è stata già eseguita
    if (!pixelRead) {

      let pixelColor

      pixelColor = get(x + 180, 160); // Coordinata x e y del pixel da leggere
      console.log('Colore del pixel:', pixelColor);
      let r = pixelColor[0];
      let g = pixelColor[1];
      let b = pixelColor[2];
      if(r ===255 && g === 255 && b ===255){
        //ok, il gioco continua
        console.log("continua...")
      }else{
        //collisione, il gioco si ferma
        console.log("collisione!")
        statoCollisione=1
        
      }
      
      pixelRead = true; // Imposta la variabile a true per indicare che la lettura è stata eseguita
    }
    lastIndex = index; // Aggiorna l'ultimo indice


  } else {
    pixelRead = false; // Se non è cambiata l'immagine, reimposta la variabile per l'immagine successiva
  }
  
}
//funzione che genera un delay non bloccante
function checkDelay(delay) {
  // Se sono trascorsi almeno 'delay' millisecondi dall'ultimo cambio, restituisce true
  if (millis() - lastChange >= delay) {
    lastChange = millis(); // aggiorna l'ultimo tempo di cambio
    return true;
  }
  return false;
}
//funzione che disegna lo scenario di gioco e memorizza i dati per il punteggio
function drawScenario(zoomSpeed, fadeSpeed, fadeStart, delay) {
  // Calcola l'indice dell'immagine successiva
  let nextIndex = (index + 1) % (scenario.length);

  // Applica la traslazione all'immagine successiva
  push();
  translate(width / 2, height / 2); // sposta l'origine al punto di zoom
  if(livello===1){
    image(scenario[nextIndex], -x_scenario, -y_scenario, height*4000/1080, height); // disegna l'immagine rispetto al nuovo origine
  }else if(livello===2){
    image(scenarioLV2[nextIndex], -x_scenario, -y_scenario, height*4000/1080, height); // disegna l'immagine rispetto al nuovo origine
  }
  pop();

  // Se stiamo ancora zoomando, aumenta il fattore di zoom
  if (zooming) {
    zoom += zoomSpeed; // usa zoomSpeed per cambiare la velocità dello zoom
  }

  // Applica lo zoom e il tint solo all'immagine corrente
  push();
  translate(width / 2, height / 2); // sposta l'origine al punto di zoom
  scale(zoom);
  tint(255, alpha); // Applica il tint prima di disegnare l'immagine
 
  if(livello===1){
    image(scenario[index], -x_scenario, -y_scenario, height*4000/1080, height); // disegna l'immagine rispetto al nuovo origine

  }else if(livello===2){
    image(scenarioLV2[index], -x_scenario, -y_scenario, height*4000/1080, height); // disegna l'immagine rispetto al nuovo origine

  }
  if (index == 1) { // Se l'immagine corrente è la seconda immagine
    gestioneAereo(); // Disegna l'aereo
  }
  pop();

  // Se abbiamo raggiunto il fattore di zoom desiderato, inizia a dissolvere
  if (zoom >= fadeStart) { // usa fadeStart per determinare quando iniziare la dissolvenza
    zooming = false;
    alpha -= fadeSpeed; // usa fadeSpeed per cambiare la velocità della dissolvenza
  }

  // Se l'immagine è completamente trasparente e il ritardo è passato, passa all'immagine successiva
  //if (false) {
  if (alpha <= 0 && checkDelay(delay)) {
    alpha = 255;
    zoom = 1;
    zooming = true;
    index = nextIndex;

    //punteggio
    if(fade===256){
      altezzaAereo[cont-10]=((700-aereoY))+1500
      cont+=1
      console.log("Contatore: "+cont)
    }
    
  }

  // Ripristina l'opacità per le altre immagini
  noTint();


  // Imposta il colore del testo
  
  // console.log(zoom);
  return { numeroScenario: index, posX: x_scenario , dimImgX: height*4000/1080, valZoom: zoom};
}
//funzione che monitora la tastiera in modo bloccante
function handleContinuousMovement() {
  //da un effetto di faticamento del motore
  if(!inizio){
    if (keyIsDown(87)) { // W
      aereoY = constrain(aereoY - movementSpeed, 0, height); // Muovi l'aereo verso l'alto
      if(movementSpeed>2&&!(aereoY - height / (aereo.height/2)< 0)){  //blocca anche l'incremento nel caso in cui l'aereo fosse al bordo
        movementSpeed-=0.01
      }
      
    }else if (keyIsDown(83)) { // S
      aereoY = constrain(aereoY + movementSpeed, 0, height); // Muovi l'aereo verso il basso
      //aereo in caduta quindi aumenta la velocità
      if(movementSpeed<6&&!(aereoY + height / (aereo.height/2) > height)){
        movementSpeed+=0.01
      }    
    }else if(movementSpeed<4){  //riporta la velocità normale
      movementSpeed+=0.01
    }else if(movementSpeed>4){
      movementSpeed-=0.01
    }
  
    // Controlla se l'aereo sta uscendo dal bordo superiore o inferiore dello schermo e lo vincola all'area visibile
    if (aereoY - height / (aereo.height/2)< 0) {
      aereoY = height / (aereo.height/2);
    } else if (aereoY + height / (aereo.height/2) > height) {
      aereoY = height - height / (aereo.height/2);
    }
    if (keyIsDown(65)) { // A
      x_scenario = constrain(x_scenario - movementSpeed, 0, height*4000/1080); // Muovi l'immagine verso destra
    }
    if (keyIsDown(68)) { // D
      x_scenario = constrain(x_scenario + movementSpeed, 0, height*4000/1080); // Muovi l'immagine verso sinistra
    }
  }else{
    if(livello===1){
      if (keyIsDown(87)) { // W
        offsetYInizio = constrain(offsetYInizio + movementSpeed, 0, partenza.height); // Muovi l'aereo verso l'alto
      }
      if (keyIsDown(83)) { // S
        offsetYInizio = constrain(offsetYInizio - movementSpeed, 0, partenza.height); // Muovi l'aereo verso il basso
      }
    }else if(livello===2){
      if (keyIsDown(87)) { // W
        offsetYInizio = constrain(offsetYInizio + movementSpeed, 0, partenzaLV2.height); // Muovi l'aereo verso l'alto
      }
      if (keyIsDown(83)) { // S
        offsetYInizio = constrain(offsetYInizio - movementSpeed, 0, partenzaLV2.height); // Muovi l'aereo verso il basso
      }
    }
  }
}
//funzione che disegna la schermata di gioco e stampa i dati fisici riguardanti il volo
function drawSchermataDiGioco() {
  image(img, 0, 0, width, height);
  fill(0);
  textSize(32);
  let num = ((700-aereoY))+1500;
  text(num.toFixed(0) +" ft", 1200, 450);
  num=movementSpeed*100/4
  text(num.toFixed(0)+" kts", 1200, 350)
  if(statoCollisione===1&&index!==0){
    image(gameOverIMG,0,0,width,height)
    //while(!keyIsDown(32)){}
    noLoop()
  }
  // }else if(statoGame){
  //   image(pauseIMG,0,0,width,height)
  //   noLoop()
  // }
}
//funzione che monitora la tastiera in modo non bloccante
function keyPressed() { //funzione di p5 che viene richiamata automaticamente alla pressione di un tasto, utilizzata per 
  if (keyCode === 32&&!isLooping()) { // 32 è il codice ASCII per la barra spaziatrice

    //window.location.reload()  //comando che ricarica la pagina
    cont=2
    fade=0
    offsetYInizio=0
    inizio=true
    index = 0; // indice per tenere traccia dell'immagine corrente
    alpha = 255; // opacità iniziale
    zoom = 1; // fattore di zoom iniziale
    zooming = true; // stato dello zoom
    pixelRead = false; // Variabile per tenere traccia se la lettura del pixel è già stata eseguita
    lastIndex = -1; // Variabile per tenere traccia dell'ultimo indice

    loop()
    // Ripristina lo stato del gioco qui
    // loop(); // Riprende il ciclo di draw
    // stato = 0; // Imposta lo stato del gioco a 1 (o qualsiasi altro valore che rappresenti il gioco in corso)
    // inizio=true;
  }
  if (keyCode === 27&&!statoCollisione) { // 27 è il codice ASCII per il tasto "Esc"
    if(isLooping()){
      statoGame=1
    } else {
      statoGame=0
      loop();
    }
  }
  if (keyCode === 46&&isLooping()) { // 46 è il codice ASCII per il tasto "Canc"
    window.location.reload()  //comando che ricarica la pagina
  }
  if (keyCode==49&&cont==2) { // 1 --> selezione del livello 1
    cont=3
  }
  if (keyCode==50&&cont==2) { // 2 --> selezione del livello 2
    cont=4
  }
  
}
//funzione che gestisce la schermata di pausa
function mostraPausa(){ //funzione che mostra la schermata di pausa pk nel keyPressed può essere richiamato in qualunque momento
  if(statoGame){
    image(pauseIMG,0,0,width,height)
    noLoop()
  }
}
//funzione che gestisce la posizione del aereo durante il gioco
function gestioneAereo(){
  // push()
  // // Trasla il punto di origine al centro del canvas
  // translate(width / 2, height / 2);

  // // Ruota il canvas di un certo angolo (in radianti)
  // rotate(PI / 6); 

  // // Disegna l'immagine centrata rispetto al punto di rotazione
  // imageMode(CENTER);
  // image(aereo, ((width / 4) * 3) / 2 - (width / 3) / 2, aereoY - (height / 3) / 2, width / 4, height / 4);
  // pop()
  if(!inizio){
    image(aereo, ((width / 4) * 3) / 2 - (width / 3) / 2, aereoY - (height / 3) / 2, width / 4, height / 4);
  }else{

    image(aereo, width/2-(aereo.width/2) , height/4*3-(aereo.height/2), width / 4, height / 4);
    
    
  }
  
}
//funzione che si occupa del decollo e del atterraggio del aereo
function partenzaArrivo(){
  if(inizio){
    if(livello===1){
      image(partenza, 0, (height-width)+offsetYInizio, width, width); // Disegna la prima immagine
    }else if(livello===2){
      image(partenzaLV2, 0, (height-width)+offsetYInizio, width, width); // Disegna la prima immagine
    }
    
  
  
    // Imposta il colore del testo
    fill(0);
    
    // Imposta il tipo di carattere e la dimensione
    textSize(32);
    
    if(cont>=30){
      // Stampa il testo nella posizione (x, y)
      image(vignettaIMG, 0,0, width, height)
      text("Portati a 0 feet\n" + offsetYInizio.toFixed(0) +" ft", 100, 155);
      text("Esc to go to pause\nCanc to quit the game", 1200, 600);
      

      //calcolo del punteggio
      if(offsetYInizio===0){
        let sommaCentro=0
        let sommaSbagliata=0
        for(let i=0; i<20; i=i+1){
          if(1700<altezzaAereo[i]&&altezzaAereo[i]<1900){
            sommaCentro+=1
          }else{
            sommaSbagliata+=1
          }
        }
        let punteggio=sommaCentro-sommaSbagliata
        //se viene un numero vicino allo 0 tanto DELFINAGGIO altrimenti se è più lontano dallo 0 vuol dire che il volo è stato eseguito correttamente
        image(punteggioIMG,0,0,width,height)
        fill(0);
        textSize(32);
        if(-5 < punteggio && punteggio < 5){
            text("NEEDS IMPROVEMENT", 50, 400); 
            text("Il tuo aereo ha mostrato un alto livello di delfinaggio, che ha reso il volo instabile.\nProva a mantenere un volo più stabile la prossima volta.", 50, 450);
          } else {
            text("GOOD JOB", 50, 400);
            text("Il tuo aereo ha mostrato un basso livello di delfinaggio, rendendo il volo stabile e sicuro.\nContinua così!", 50, 450);
          }  
        noLoop()
      }
    }else{
      // Stampa il testo nella posizione (x, y)
      image(vignettaIMG, 0,0, width, height)
      text("Portati a 1500 feet\n" + offsetYInizio.toFixed(0) +" ft", 100, 150);
      text("Esc to go to pause\nCanc to quit the game", 1200, 600);
    }
    

    
    console.log(offsetYInizio)
    if(cont<30){
      if(livello===1){
        if(offsetYInizio>(partenza.height/2)){
          inizio=false;
        }
      }else if(livello===2){
        if(offsetYInizio>(partenzaLV2.height/2)){
          inizio=false;
        }
      }
    }
  }else{
    
    // Disegna la prima immagine con una dissolvenza
    tint(255, 255 - fade); // Applica la trasparenza all'immagine in base al valore di fade
    if(livello===1){
      image(partenza, 0,(height-width)+offsetYInizio, width, width); // Disegna la prima immagine
    }else if(livello===2){
      // y_scenario_inzioFine+=offsetYInizio/width
      // image(partenzaLV2, 0,y_scenario_inzioFine, width, width); // Disegna la prima immagine
      image(partenzaLV2, 0,(height-width)+offsetYInizio, width, width)
    }
    
    
    // // Disegna la seconda immagine con una dissolvenza
    tint(255, fade); // Applica la trasparenza all'immagine in base al valore di fade
    handleContinuousMovement()//velocità di spostamento x e y del aereo
    // width e height sono rispetto alla grandezza del canvas, cioè nel mio caso dello schermo
    let infoScenario=drawScenario(0.01*movementSpeed/4, 2*movementSpeed/4, 1.8, 4000); //<velocità dello zoom>,<velocità della dissolvenza>,<valore di zoom a cui inizia la dissolvenza>,<tempo di durata del immagine statica (è incluso anche il delay) in millisecondi>
    drawMap((width / 4) * 3+15, 20, infoScenario.posX,infoScenario.numeroScenario, infoScenario.valZoom, 1.8); 
    drawSchermataDiGioco();
    gestioneAereo();
    // Aggiorna il valore di fade per la dissolvenza
    fade += 1; 
    noTint()  //fa si che la dissolvenza non vada sulle altre cose
  }
}
//funzione che si occupa di fare un introduzione al inizio del videogioco
function mostraTitolo(){
  if (cont===0){
    image(titoloIMG,0,0,width,height)
    if(checkDelay(3000)){
      cont++
    }
  }
  if(cont===1){
    image(infoIMG,0,0,width,height)
    if(checkDelay(6000)){
      cont++
    }
  }
  if(cont===2){
    image(livelloIMG,0,0,width,height)
    //attendere la selezione del livello --> fatto tramite un altra funzione non bloccante a parte
  }
}

function preload() {
  img = loadImage('./IMG/cockpit.png'); 
  map = loadImage('./IMG/map/miniMap.png');
  aereo = loadImage('./IMG/aereo.png')
  scenarioLV2[0]=loadImage('./IMG/scenario/1.png')
  scenarioLV2[1]=loadImage('./IMG/scenario/2.png')
  scenarioLV2[2]=loadImage('./IMG/scenario/3.png')
  scenarioLV2[3]=loadImage('./IMG/scenario/4.png')
  scenarioLV2[4]=loadImage('./IMG/scenario/5.png')
  scenarioLV2[5]=loadImage('./IMG/scenario/6.png')
  scenarioLV2[6]=loadImage('./IMG/scenario/7.png')
  scenarioLV2[7]=loadImage('./IMG/scenario/8.png')
  scenarioLV2[8]=loadImage('./IMG/scenario/9.png')
  scenarioLV2[9]=loadImage('./IMG/scenario/10.png')
  scenario[0] = loadImage(`./IMG/scenario2/1.png`); 
  scenario[1] = loadImage(`./IMG/scenario2/2.png`); 
  scenario[2] = loadImage(`./IMG/scenario2/3.png`); 
  scenario[3] = loadImage(`./IMG/scenario2/4.png`); 
  scenario[4] = loadImage(`./IMG/scenario2/5.png`); 
  scenario[5] = loadImage(`./IMG/scenario2/6.png`); 
  scenario[6] = loadImage(`./IMG/scenario2/7.png`); 
  scenario[7] = loadImage(`./IMG/scenario2/8.png`); 
  scenario[8] = loadImage(`./IMG/scenario2/9.png`); 
  scenario[9] = loadImage(`./IMG/scenario2/10.png`);
  partenza= loadImage('./IMG/start&stop/partenza.png')
  partenzaLV2=loadImage('./IMG/start&stop/partenza2.png')
  gameOverIMG= loadImage('./IMG/gameover.png')
  pauseIMG=loadImage('./IMG/pause.png')
  infoIMG=loadImage('./IMG/info.png')
  titoloIMG=loadImage('./IMG/titolo.png')
  livelloIMG=loadImage('./IMG/livello.png')
  punteggioIMG=loadImage("./IMG/punteggio.png")
  vignettaIMG=loadImage('./IMG/vignetta.png')
  cieloLV2=loadImage('./IMG/start&stop/cieloLV2.png')
  // mySound = loadSound('./MP3/aereo.wav');
}

function setup() {
  createCanvas(windowWidth, windowHeight); // Imposta le dimensioni del canvas per corrispondere alle dimensioni dello schermo
  noStroke();
  x_scenario = width / 2;
  y_scenario = height / 2;
  aereoY = height / 2;
}

function draw() {
  // if (mySound && mySound.isPlaying()) {
  //   mySound.play();
  // }
  
  
 
  //gioco
  // if(livello===1){
  //   background(100, 211, 255); // Pulisce lo sfondo
  // }
  
  if(fade<=255){
    if(cont<3){
      //mostro il titolo e le info sul gioco
      mostraTitolo()
    }
    if(cont===3){
      livello=1
      //aspettare il tasto premuto e poi iniziare a incrementare la velocita del aereo e stamparla
      partenzaArrivo()
      handleContinuousMovement()
      gestioneAereo()
    }else if(cont===4){
      livello=2
      partenzaArrivo()
      handleContinuousMovement()
      gestioneAereo()
      //aggiungere la nebbia a tutti gli scenari... (stampare nel layer prima del aereo la nebbia) 
    }
    
    
  }else if(cont<30){
    if((cont===4||cont===3)&&fade===256){
      cont =10
    }
    
    handleContinuousMovement()//velocità di spostamento x e y del aereo
    // width e height sono rispetto alla grandezza del canvas, cioè nel mio caso dello schermo
    let infoScenario=drawScenario(0.01*movementSpeed/4, 2*movementSpeed/4, 1.8, 4000); //<velocità dello zoom>,<velocità della dissolvenza>,<valore di zoom a cui inizia la dissolvenza>,<tempo di durata del immagine statica (è incluso anche il delay) in millisecondi>
    drawMap((width / 4) * 3+15, 20, infoScenario.posX,infoScenario.numeroScenario, infoScenario.valZoom, 1.8); 
    gestioneAereo();
    drawSchermataDiGioco();
  }
  if(cont>=29){
    //videogioco finito, fare atterraggio e dare punteggio
    if(cont===29){
      inizio=true
      offsetYInizio=((700-aereoY))+1500
      cont=30
      if(livello===1){
        image(partenza, 0,0, width, width)
      }else if(livello===2){
        image(cieloLV2, 0,0, width, width)
      }
    }
    partenzaArrivo()
    handleContinuousMovement()
    if(isLooping()){
      gestioneAereo()
    }
    console.log("Fine gioco!!!")    
  }
  mostraPausa()
}
