// Bakeoff #3 - Escrita em Smartwatches
// IPM 2020-21, Semestre 2
// Entrega: até dia 4 de Junho às 23h59 através do Fenix
// Bake-off: durante os laboratórios da semana de 31 de Maio

// p5.js reference: https://p5js.org/reference/

// Database (CHANGE THESE!)
const GROUP_NUMBER   = 52;      // add your group number here as an integer (e.g., 2, 3)
const BAKE_OFF_DAY   = false;  // set to 'true' before sharing during the simulation and bake-off days

// Our Database
const ITERATION      = 'First'
const STORE          = true;

let PPI, PPCM;                 // pixel density (DO NOT CHANGE!)
let second_attempt_button;     // button that starts the second attempt (DO NOT CHANGE!)

// Finger parameters (DO NOT CHANGE!)
let finger_img;                // holds our finger image that simules the 'fat finger' problem
let FINGER_SIZE, FINGER_OFFSET;// finger size and cursor offsett (calculated after entering fullscreen)

// Arm parameters (DO NOT CHANGE!)
let arm_img;                   // holds our arm/watch image
let ARM_LENGTH, ARM_HEIGHT;    // arm size and position (calculated after entering fullscreen)

// Study control parameters (DO NOT CHANGE!)
let draw_finger_arm  = false;  // used to control what to show in draw()
let phrases          = [];     // contains all 501 phrases that can be asked of the user
let current_trial    = 0;      // the current trial out of 2 phrases (indexes into phrases array above)
let attempt          = 0       // the current attempt out of 2 (to account for practice)
let target_phrase    = "";     // the current target phrase
let currently_typed  = "";     // what the user has typed so far
let entered          = new Array(2); // array to store the result of the two trials (i.e., the two phrases entered in one attempt)
let CPS              = 0;      // add the characters per second (CPS) here (once for every attempt)

// Metrics
let attempt_start_time, attempt_end_time; // attemps start and end times (includes both trials)
let trial_end_time;            // the timestamp of when the lastest trial was completed
let letters_entered  = 0;      // running number of letters entered (for final WPM computation)
let letters_expected = 0;      // running number of letters expected (from target phrase)
let errors           = 0;      // a running total of the number of errors (when hitting 'ACCEPT')
let database;                  // Firebase DB

// 2D Keyboard UI
let keyboard, instructions;

// Click variables
let click, clickX, clickY;
let releasedX, releasedY;

let current_word = "";

// Runs once before the setup() and loads our data (images, phrases)
function preload()
{    
  // Loads simulation images (arm, finger) -- DO NOT CHANGE!
  arm = loadImage("data/arm_watch.png");
  fingerOcclusion = loadImage("data/finger.png");
    
  // Loads the target phrases (DO NOT CHANGE!)
  phrases = loadStrings("data/phrases.txt");
  
  // Loads UI elements for our basic keyboard
  leftArrow = loadImage("data/left.png");
  rightArrow = loadImage("data/right.png");

  // Loads UI elements for our basic keyboard
  keyboard = loadImage("data/keyboard.png");
  instructions = loadImage("data/instructions.png");
}

// Runs once at the start
function setup()
{
  createCanvas(700, 500);   // window size in px before we go into fullScreen()
  frameRate(60);            // frame rate (DO NOT CHANGE!)
  
  // DO NOT CHANGE THESE!
  shuffle(phrases, true);   // randomize the order of the phrases list (N=501)
  target_phrase = phrases[current_trial];
  
  drawUserIDScreen();       // draws the user input screen (student number and display size)
  
  drawInstructions();
}

function drawInstructions()
{
  push();
  noStroke();
  fill(color(73, 171,228));
  textAlign(LEFT);
  textFont("Arial", 23);
  textStyle(BOLD);
  text("Instructions:", width * 0.015, height * 0.49);
  pop();
  
  push();
  noStroke();
  fill(color(255,255,255));
  textAlign(LEFT);
  textFont("Arial", 17);
  text("Click", width * 0.015, height * 0.57);
  fill(color(73, 171,228));
  text("=", width * 0.075, height * 0.57);
  fill(color(255,255,255));
  textStyle(ITALIC);
  text("Input: g", width * 0.1, height * 0.57);
  pop();
  
  push();
  image(instructions, width * 0.015, height * 0.60, width/6, height/5)
  pop();
  
  push();
  // make the arrow pointline
  stroke(color(73, 171,228));
  strokeWeight(3);
  fill(color(73, 171,228));
  line(width * 0.17, height * 0.70, width * 0.33, height * 0.70); //draw a line beetween the vertices
  pop();
  
  push();
  // make the arrow point
  noStroke();
  fill(color(73, 171,228));
  triangle(width * 0.35, height * 0.70, width * 0.33, height * 0.687, width * 0.33, height * 0.713); //draws the arrow point as a triangle
  pop();
  
  push();
  // make the arrow pointline
  stroke(color(73, 171,228));
  strokeWeight(3);
  fill(color(73, 171,228));
  line(width * 0.17, height * 0.78, width * 0.33, height * 0.87); //draw a line beetween the vertices
  pop();
  
  push();
  // make the arrow point
  noStroke();
  fill(color(73, 171,228));
  triangle(width * 0.35, height * 0.88, width * 0.333, height * 0.858, width * 0.325, height * 0.88); //draws the arrow point as a triangle
  pop();
  
  push();
  fill(255);
  textFont("Arial", 17);
  textStyle(ITALIC);
  text("Input: h" , width * 0.35, height * 0.71);
  text("Input: n", width * 0.35, height * 0.89);
  textFont("Arial", 12);
  text("Click+Swipe Right" , width * 0.19, height * 0.67)
  text("Click+Swipe Diagonally" , width * 0.06, height * 0.86)
  pop();
}

function draw()
{ 
  if(draw_finger_arm)
  {
    background(255);           // clear background
    noCursor();                // hides the cursor to simulate the 'fat finger'
    
    drawArmAndWatch();         // draws arm and watch background
    writeTargetAndEntered();   // writes the target and entered phrases above the watch
    drawACCEPT();              // draws the 'ACCEPT' button that submits a phrase and completes a trial
    
    // Draws the non-interactive screen area (4x1cm) -- DO NOT CHANGE SIZE!
    noStroke();
    fill(125);
    rect(width/2 - 2.0*PPCM, height/2 - 2.0*PPCM, 4.0*PPCM, 1.0*PPCM);
    textAlign(CENTER); 
    textFont("Arial", 16);
    fill(0);
    text(current_word, width/2, height/2 - 1.3 * PPCM);

    // Draws the touch input area (4x3cm) -- DO NOT CHANGE SIZE!
    stroke(0, 255, 0);
    noFill();
    rect(width/2 - 2.0*PPCM, height/2 - 1.0*PPCM, 4.0*PPCM, 3.0*PPCM);

    draw2Dkeyboard();       // draws our basic 2D keyboard UI

    drawFatFinger();        // draws the finger that simulates the 'fat finger' problem
  }
}

// Draws 2D keyboard UI (current letter and left and right arrows)
function draw2Dkeyboard()
{
  imageMode(CORNER);
  image(keyboard, width/2 - 2.0*PPCM, height/2 - 1.0*PPCM, 4.0*PPCM, 3.0*PPCM); 
}

// Evoked when the mouse button was pressed
function mousePressed()
{
  click = false;
  // Only look for mouse presses during the actual test
  if (draw_finger_arm)
  {                   
    // Check if mouse click happened within the touch input area
    if(mouseClickWithin(width/2 - 2.0*PPCM, height/2 - 1.0*PPCM, 4.0*PPCM, 3.0*PPCM))  
    {
      click = true;
      clickX = mouseX;
      clickY = mouseY;
    }
    
    // Check if mouse click happened within 'ACCEPT' 
    // (i.e., submits a phrase and completes a trial)
    else if (mouseClickWithin(width/2 - 2*PPCM, height/2 - 5.1*PPCM, 4.0*PPCM, 2.0*PPCM))
    {
      // Saves metrics for the current trial
      letters_expected += target_phrase.trim().length;
      letters_entered += currently_typed.trim().length;
      errors += computeLevenshteinDistance(currently_typed.trim(), target_phrase.trim());
      entered[current_trial] = currently_typed;
      trial_end_time = millis();

      current_trial++;

      // Check if the user has one more trial/phrase to go
      if (current_trial < 2)                                           
      {
        // Prepares for new trial
        currently_typed = "";
        current_word = "";
        target_phrase = phrases[current_trial];  
      }
      else
      {
        // The user has completed both phrases for one attempt
        draw_finger_arm = false;
        attempt_end_time = millis();
        
        printAndSavePerformance();        // prints the user's results on-screen and sends these to the DB
        attempt++;

        // Check if the user is about to start their second attempt
        if (attempt < 2)
        {
          second_attempt_button = createButton('START 2ND ATTEMPT');
          second_attempt_button.mouseReleased(startSecondAttempt);
          second_attempt_button.position(width/2 - second_attempt_button.size().width/2, height/2 + 250);
        }
      }
    }
  }
}

function mouseReleased()
{
  let letter = '';
  if (click)
  {
    click = false;
    releaseX = mouseX;
    releaseY = mouseY;
    
    // First Button
    if (clickX > (width/2 - 2.0*PPCM) && clickX < (width/2 - 2.0*PPCM + 4.0*PPCM/3) && clickY > (height/2 - 1.0*PPCM) && clickY < (height/2 + 1.0*PPCM))
    {
      if (abs(clickX - releaseX) < 20 && abs(clickY - releaseY) < 40)
        letter += 's';
      else if (abs(clickX - releaseX) > 20 && abs(clickY - releaseY) < 40 && clickX > releaseX)       
        letter += 'a';
      else if (abs(clickX - releaseX) > 20 && abs(clickY - releaseY) < 40 && clickX < releaseX)  
        letter += 'd';
      else if (abs(clickX - releaseX) < 20 && abs(clickY - releaseY) > 40 && clickY > releaseY)  
        letter += 'w';
      else if (abs(clickX - releaseX) < 20 && abs(clickY - releaseY) > 40 && clickY < releaseY)  
        letter += 'x';
      else if (abs(clickX - releaseX) > 20 && abs(clickY - releaseY) > 40 && clickX > releaseX && clickY > releaseY)  
        letter += 'q';
      else if (abs(clickX - releaseX) > 20 && abs(clickY - releaseY) > 40 && clickX < releaseX && clickY > releaseY)  
        letter += 'e';
      else if (abs(clickX - releaseX) > 20 && abs(clickY - releaseY) > 40 && clickX > releaseX && clickY < releaseY)  
        letter += 'z';
      else if (abs(clickX - releaseX) > 20 && abs(clickY - releaseY) > 40 && clickX < releaseX && clickY < releaseY)  
        letter += 'c';
      currently_typed += letter;
      current_word += letter;
    }
    // Second Button
    else if (clickX > (width/2 - 2.0*PPCM + 4.0*PPCM/3) && clickX < (width/2 - 2.0*PPCM + 2*(4.0*PPCM/3)) && clickY > (height/2 - 1.0*PPCM) && clickY < (height/2 + 1.0*PPCM))
    {
      if (abs(clickX - releaseX) < 20 && abs(clickY - releaseY) < 40)
        letter += 'g';
      else if (abs(clickX - releaseX) > 20 && abs(clickY - releaseY) < 40 && clickX > releaseX)       
        letter += 'f';
      else if (abs(clickX - releaseX) > 20 && abs(clickY - releaseY) < 40 && clickX < releaseX)  
        letter += 'h';
      else if (abs(clickX - releaseX) < 20 && abs(clickY - releaseY) > 40 && clickY > releaseY)  
        letter += 't';
      else if (abs(clickX - releaseX) < 20 && abs(clickY - releaseY) > 40 && clickY < releaseY)  
        letter += 'b';
      else if (abs(clickX - releaseX) > 20 && abs(clickY - releaseY) > 40 && clickX > releaseX && clickY > releaseY)  
        letter += 'r';
      else if (abs(clickX - releaseX) > 20 && abs(clickY - releaseY) > 40 && clickX < releaseX && clickY > releaseY)  
        letter += 'y';
      else if (abs(clickX - releaseX) > 20 && abs(clickY - releaseY) > 40 && clickX > releaseX && clickY < releaseY)  
        letter += 'v';
      else if (abs(clickX - releaseX) > 20 && abs(clickY - releaseY) > 40 && clickX < releaseX && clickY < releaseY)  
        letter += 'n';
      currently_typed += letter;
      current_word += letter;
    }
    // Third Button
    else if (clickX > (width/2 - 2.0*PPCM + 2*(4.0*PPCM/3)) && clickX < (width/2 - 2.0*PPCM + 3*(4.0*PPCM/3)) && clickY > (height/2 - 1.0*PPCM) && clickY < (height/2 + 1.0*PPCM))
    {
      if (abs(clickX - releaseX) < 20 && abs(clickY - releaseY) < 40) 
        letter += 'k';
      else if (abs(clickX - releaseX) > 20 && abs(clickY - releaseY) < 40 && clickX > releaseX)       
        letter += 'j';
      else if (abs(clickX - releaseX) > 20 && abs(clickY - releaseY) < 40 && clickX < releaseX)  
        letter += 'p';
      else if (abs(clickX - releaseX) < 20 && abs(clickY - releaseY) > 40 && clickY > releaseY)  
        letter += 'i';
      else if (abs(clickX - releaseX) > 20 && abs(clickY - releaseY) > 40 && clickX > releaseX && clickY > releaseY)  
        letter += 'u';
      else if (abs(clickX - releaseX) > 20 && abs(clickY - releaseY) > 40 && clickX < releaseX && clickY > releaseY)  
        letter += 'o';
      else if (abs(clickX - releaseX) > 20 && abs(clickY - releaseY) > 40 && clickX > releaseX && clickY < releaseY)  
        letter += 'm';
      else if (abs(clickX - releaseX) > 20 && abs(clickY - releaseY) > 40 && clickX < releaseX && clickY < releaseY)  
        letter += 'l';
      currently_typed += letter;
      current_word += letter;
    }
    // Space
    else if (clickX > (width/2 - 2.0*PPCM) && clickX < (width/2 - 2.0*PPCM + 2*(4.0*PPCM/3)) && clickY > (height/2 + 1.0*PPCM) && clickY < (height/2 + 2*(1.0*PPCM)))
    {
      currently_typed += ' ';
      current_word = '';
    }
    // Delete
    else if (clickX > (width/2 - 2.0*PPCM + 2*(4.0*PPCM/3)) && clickX < (width/2 - 2.0*PPCM + 3*(4.0*PPCM/3)) && clickY > (height/2 + 1.0*PPCM) && clickY < (height/2 + 2*(1.0*PPCM)))
    {
      currently_typed = currently_typed.substring(0, currently_typed.length - 1);
      current_word = current_word.substring(0, current_word.length - 1);
    }
  }
}

// Resets variables for second attempt
function startSecondAttempt()
{
  // Re-randomize the trial order (DO NOT CHANG THESE!)
  shuffle(phrases, true);
  current_trial        = 0;
  target_phrase        = phrases[current_trial];
  
  // Resets performance variables (DO NOT CHANG THESE!)
  letters_expected     = 0;
  letters_entered      = 0;
  errors               = 0;
  currently_typed      = "";
  CPS                  = 0;
  
  current_word         = "";

  // Show the watch and keyboard again
  second_attempt_button.remove();
  draw_finger_arm      = true;
  attempt_start_time   = millis();  
}

// Print and save results at the end of 2 trials
function printAndSavePerformance()
{
  // DO NOT CHANGE THESE
  let attempt_duration = (attempt_end_time - attempt_start_time) / 60000;          // 60K is number of milliseconds in minute
  let wpm              = (letters_entered / 5.0) / attempt_duration;
  CPS = letters_entered / (attempt_duration * 60); 
  let freebie_errors   = letters_expected * 0.05;                                  // no penalty if errors are under 5% of chars
  let penalty          = max(0, (errors - freebie_errors) / attempt_duration); 
  let wpm_w_penalty    = max((wpm - penalty),0);                                   // minus because higher WPM is better: NET WPM
  let timestamp        = day() + "/" + month() + "/" + year() + "  " + hour() + ":" + minute() + ":" + second();
  
  background(color(0,0,0));    // clears screen
  cursor();                    // shows the cursor again
  
  textFont("Arial", 16);       // sets the font to Arial size 16
  fill(color(255,255,255));    //set text fill color to white
  text(timestamp, 100, 20);    // display time on screen 
  
  text("Finished attempt " + (attempt + 1) + " out of 2!", width / 2, height / 2); 
  
  // For each trial/phrase
  let h = 20;
  for(i = 0; i < 2; i++, h += 40 ) 
  {
    text("Target phrase " + (i+1) + ": " + phrases[i], width / 2, height / 2 + h);
    text("User typed " + (i+1) + ": " + entered[i], width / 2, height / 2 + h+20);
  }
  
  text("Raw WPM: " + wpm.toFixed(2), width / 2, height / 2 + h+20);
  text("Raw CPS: " + CPS.toFixed(2), width / 2, height / 2 + h+40);
  text("Freebie errors: " + freebie_errors.toFixed(2), width / 2, height / 2 + h+60);
  text("Penalty: " + penalty.toFixed(2), width / 2, height / 2 + h+80);
  text("WPM with penalty: " + wpm_w_penalty.toFixed(2), width / 2, height / 2 + h+100);

  // Saves results (DO NOT CHANGE!)
  let attempt_data = 
  {
        project_from:         GROUP_NUMBER,
        assessed_by:          student_ID,
        attempt_completed_by: timestamp,
        attempt:              attempt,
        attempt_duration:     attempt_duration,
        raw_wpm:              wpm,      
        freebie_errors:       freebie_errors,
        penalty:              penalty,
        wpm_w_penalty:        wpm_w_penalty,
        cps:                  CPS
  }
  
  // Send data to DB (DO NOT CHANGE!)
  if (BAKE_OFF_DAY)
  {
    // Access the Firebase DB
    if (attempt === 0)
    {
      firebase.initializeApp(firebaseConfig);
      database = firebase.database();
    }
    
    // Add user performance results
    let db_ref = database.ref('G' + GROUP_NUMBER);
    db_ref.push(attempt_data);
  }
  else if (STORE)
  {
    // Initialize our Firebase
    if (attempt === 0)
    {
    firebase.initializeApp(myFirebaseConfig);
    database = firebase.database();
    }
    let ref = database.ref('Scores/'+ ITERATION + '/' + student_ID);
    ref.push(attempt_data);
  }
}

// Is invoked when the canvas is resized (e.g., when we go fullscreen)
function windowResized()
{
  resizeCanvas(windowWidth, windowHeight);
  let display    = new Display({ diagonal: display_size }, window.screen);
  
  // DO NO CHANGE THESE!
  PPI           = display.ppi;                        // calculates pixels per inch
  PPCM          = PPI / 2.54;                         // calculates pixels per cm
  FINGER_SIZE   = (int)(11   * PPCM);
  FINGER_OFFSET = (int)(0.8  * PPCM)
  ARM_LENGTH    = (int)(19   * PPCM);
  ARM_HEIGHT    = (int)(11.2 * PPCM);
  
  ARROW_SIZE    = (int)(2.2 * PPCM);
  
  // Starts drawing the watch immediately after we go fullscreen (DO NO CHANGE THIS!)
  draw_finger_arm = true;
  attempt_start_time = millis();
}