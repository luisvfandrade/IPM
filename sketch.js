// Bakeoff #3 - Escrita em Smartwatches
// IPM 2020-21, Semestre 2
// Entrega: até dia 4 de Junho às 23h59 através do Fenix
// Bake-off: durante os laboratórios da semana de 31 de Maio

// p5.js reference: https://p5js.org/reference/

// Database (CHANGE THESE!)
const GROUP_NUMBER   = 52;      // add your group number here as an integer (e.g., 2, 3)
const BAKE_OFF_DAY   = false;  // set to 'true' before sharing during the simulation and bake-off days

// Our Database
const ITERATION      = 'Initial'
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
let leftArrow, rightArrow;     // holds the left and right UI images for our basic 2D keyboard   
let ARROW_SIZE;                // UI button size
let current_letter = 'a';      // current char being displayed on our basic 2D keyboard (starts with 'a')

// Click variables
let click, clickX, clickY;
let releasedX, releasedY;

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
  text("Input: a", width * 0.1, height * 0.57);
  pop();
  
  push();
  fill(255);
  stroke(51);
  rect(width * 0.015, height * 0.60, width/6, height/6);
  fill(color(73, 171,228));
  textFont("Arial", 28);
  textStyle(BOLD);
  text("a" , width * 0.080, height * 0.69);
  fill(0);
  textFont("Arial", 17);
  textStyle(ITALIC);
  text("b" , width * 0.08, height * 0.75);
  text("c" , width * 0.14, height * 0.69);
  pop();
  
  push();
  // make the arrow pointline
  stroke(color(73, 171,228));
  strokeWeight(3);
  fill(color(73, 171,228));
  line(width * 0.17, height * 0.68, width * 0.33, height * 0.68); //draw a line beetween the vertices
  pop();
  
  push();
  // make the arrow point
  noStroke();
  fill(color(73, 171,228));
  triangle(width * 0.35, height * 0.68, width * 0.33, height * 0.667, width * 0.33, height * 0.693); //draws the arrow point as a triangle
  pop();
  
  push();
  // make the arrow pointline
  stroke(color(73, 171,228));
  strokeWeight(3);
  fill(color(73, 171,228));
  line(width * 0.09, height * 0.76, width * 0.09, height * 0.90); //draw a line beetween the vertices
  pop();
  
  push();
  // make the arrow point
  noStroke();
  fill(color(73, 171,228));
  triangle(width * 0.09, height * 0.925, width * 0.08, height * 0.90, width * 0.10, height * 0.90); //draws the arrow point as a triangle
  pop();
  
  push();
  fill(255);
  textFont("Arial", 17);
  textStyle(ITALIC);
  text("Input: c" , width * 0.35, height * 0.69);
  text("Input: b", width * 0.06, height * 0.95);
  textFont("Arial", 12);
  text("Click+Swipe Right" , width * 0.19, height * 0.65)
  text("Click+Swipe Down" , width * 0.10, height * 0.85)
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
    text("NOT INTERACTIVE", width/2, height/2 - 1.3 * PPCM);

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
  fill(255);
  stroke(51);
  rect(width/2 - 1.95*PPCM, height/2 - 1.0*PPCM, 4.0*PPCM/3, 3.0*PPCM/3);
  fill(color(73, 171,228));
  textFont("Arial", 28);
  textStyle(BOLD);
  text("a" , width/2 - 1.4*PPCM, height/2 - 0.5*PPCM);
  fill(0);
  textFont("Arial", 13);
  textStyle(ITALIC);
  text("b" , width/2 - 1.4*PPCM, height/2 - 0.1*PPCM);
  text("c" , width/2 - 0.9*PPCM, height/2 - 0.5*PPCM);
  
  fill(255);
  stroke(51);
  rect(width/2 - 0.68*PPCM, height/2 - 1.0*PPCM, 4.0*PPCM/3, 3.0*PPCM/3);
  fill(color(73, 171,228));
  textFont("Arial", 28);
  textStyle(BOLD);
  text("e" , width/2 - 0.0*PPCM, height/2 - 0.5*PPCM);
  fill(0);
  textFont("Arial", 13);
  textStyle(ITALIC);
  text("f" , width/2 + 0.40*PPCM, height/2 - 0.5*PPCM);
  text("d" , width/2 - 0.45*PPCM, height/2 - 0.5*PPCM);
  
  fill(255);
  stroke(51);
  rect(width/2 + 0.65*PPCM, height/2 - 1.0*PPCM, 4.0*PPCM/3, 3.0*PPCM/3);
  fill(color(73, 171,228));
  textFont("Arial", 28);
  textStyle(BOLD);
  text("i" , width/2 + 1.35*PPCM, height/2 - 0.5*PPCM);
  fill(0);
  textFont("Arial", 13);
  textStyle(ITALIC);
  text("h" , width/2 + 1.35*PPCM, height/2 - 0.1*PPCM);
  text("g" , width/2 + 0.9*PPCM, height/2 - 0.5*PPCM);
  
  fill(255);
  stroke(51);
  rect(width/2 - 1.95*PPCM, height/2 - 1.0*PPCM + 3.0*PPCM/3, 4.0*PPCM/3, 3.0*PPCM/3);
  fill(color(73, 171,228));
  textFont("Arial", 28);
  textStyle(BOLD);
  text("l" , width/2 - 1.4*PPCM, height/2 + 0.68*PPCM);
  fill(0);
  textFont("Arial", 13);
  textStyle(ITALIC);
  text("j" , width/2 - 1.4*PPCM, height/2 + 0.21*PPCM);
  text("k" , width/2 - 1.4*PPCM, height/2 + 0.9*PPCM);
  
  fill(255);
  stroke(51);
  rect(width/2 - 0.68*PPCM, height/2 - 1.0*PPCM + 3.0*PPCM/3, 4.0*PPCM/3, 3.0*PPCM/3);
  fill(color(73, 171,228));
  textFont("Arial", 28);
  textStyle(BOLD);
  text("o" , width/2 - 0.0*PPCM, height/2 + 0.6*PPCM);
  fill(0);
  textFont("Arial", 13);
  textStyle(ITALIC);
  text("q" , width/2 - 0.0*PPCM, height/2 + 0.9*PPCM);
  text("n" , width/2 + 0.40*PPCM, height/2 + 0.6*PPCM);
  text("m" , width/2 - 0.45*PPCM, height/2 + 0.6*PPCM);
  text("p" , width/2 - 0.0*PPCM, height/2 + 0.2*PPCM);
  
  fill(255);
  stroke(51);
  rect(width/2 + 0.65*PPCM, height/2 - 1.0*PPCM + 3.0*PPCM/3, 4.0*PPCM/3, 3.0*PPCM/3);
  fill(color(73, 171,228));
  textFont("Arial", 28);
  textStyle(BOLD);
  text("r" , width/2 + 1.35*PPCM, height/2 + 0.6*PPCM);
  fill(0);
  textFont("Arial", 13);
  textStyle(ITALIC);
  text("s" , width/2 + 1.35*PPCM, height/2 + 0.2*PPCM);
  text("t" , width/2 + 1.35*PPCM, height/2 + 0.9*PPCM);
  
  fill(255);
  stroke(51);
  rect(width/2 - 1.95*PPCM, height/2 - 1.0*PPCM + 6.0*PPCM/3, 4.0*PPCM/3, 3.0*PPCM/3);
  fill(color(73, 171,228));
  textFont("Arial", 28);
  textStyle(BOLD);
  text("u" , width/2 - 1.4*PPCM, height/2 + 1.8*PPCM);
  fill(0);
  textFont("Arial", 13);
  textStyle(ITALIC);
  text("v" , width/2 - 1.4*PPCM, height/2 + 1.3*PPCM);
  text("w" , width/2 - 0.9*PPCM, height/2 + 1.8*PPCM);
  
  fill(255);
  stroke(51);
  rect(width/2 - 0.68*PPCM, height/2 - 1.0*PPCM + 6.0*PPCM/3, 4.0*PPCM/3, 3.0*PPCM/3);
  fill(color(73, 171,228));
  textFont("Arial", 28);
  textStyle(BOLD);
  text("__" , width/2 + 0.0*PPCM, height/2 + 1.7*PPCM);
  fill(0);
  textFont("Arial", 13);
  textStyle(ITALIC);
  text("del" , width/2 - 0.45*PPCM, height/2 + 1.5*PPCM);
  
  fill(255);
  stroke(51);
  rect(width/2 + 0.65*PPCM, height/2 - 1.0*PPCM + 6.0*PPCM/3, 4.0*PPCM/3, 3.0*PPCM/3);
  fill(color(73, 171,228));
  textFont("Arial", 28);
  textStyle(BOLD);
  text("y" , width/2 + 1.35*PPCM, height/2 + 1.8*PPCM);
  fill(0);
  textFont("Arial", 13);
  textStyle(ITALIC);
  text("z" , width/2 + 1.35*PPCM, height/2 + 1.3*PPCM);
  text("x" , width/2 + 0.9*PPCM, height/2 + 1.8*PPCM);  
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
          second_attempt_button.position(width/2 - second_attempt_button.size().width/2, height/2 + 200);
        }
      }
    }
  }
}

function mouseReleased()
{
  if (click)
  {
    click = false;
    releaseX = mouseX;
    releaseY = mouseY;
    
    // First Row
    if (clickX > (width/2 - 2.0*PPCM) && clickX < (width/2 - 2.0*PPCM + 4.0*PPCM/3) && clickY > (height/2 - 1.0*PPCM) && clickY < (height/2 - 1.0*PPCM + 1.0*PPCM))
    {
      if (clickX == releaseX && clickY == releaseY) currently_typed += 'a';
      else if (clickX < releaseX && abs(clickX - releaseX) > abs(clickY - releaseY))       
        currently_typed += 'c';
      else if (clickY < releaseY && abs(clickY - releaseY) > abs(clickX - releaseX))  
        currently_typed += 'b';
    }
    else if (clickX > (width/2 - 2.0*PPCM + 4.0*PPCM/3) && clickX < (width/2 - 2.0*PPCM + 2*(4.0*PPCM/3)) && clickY > (height/2 - 1.0*PPCM) && clickY < (height/2 - 1.0*PPCM + 1.0*PPCM))
    {
      if (clickX == releaseX && clickY == releaseY) currently_typed += 'e';
      else if (clickX > releaseX && abs(clickX - releaseX) > abs(clickY - releaseY))       
        currently_typed += 'd';
      else if (clickX < releaseX && abs(clickX - releaseX) > abs(clickY - releaseY))  
        currently_typed += 'f';
    }
    else if (clickX > (width/2 - 2.0*PPCM + 2*(4.0*PPCM/3)) && clickX < (width/2 - 2.0*PPCM + 3*(4.0*PPCM/3)) && clickY > (height/2 - 1.0*PPCM) && clickY < (height/2 - 1.0*PPCM + 1.0*PPCM))
    {
      if (clickX == releaseX && clickY == releaseY) currently_typed += 'i';
      else if (clickX > releaseX && abs(clickX - releaseX) > abs(clickY - releaseY))       
        currently_typed += 'g';
      else if (clickY < releaseY && abs(clickY - releaseY) > abs(clickX - releaseX))  
        currently_typed += 'h';
    }
    // Second Row
    if (clickX > (width/2 - 2.0*PPCM) && clickX < (width/2 - 2.0*PPCM + 4.0*PPCM/3) && clickY > (height/2) && clickY < (height/2 + 1.0*PPCM))
    {
      if (clickX == releaseX && clickY == releaseY) currently_typed += 'l';
      else if (clickY > releaseY && abs(clickY - releaseY) > abs(clickX - releaseX))       
        currently_typed += 'j';
      else if (clickY < releaseY && abs(clickY - releaseY) > abs(clickX - releaseX))  
        currently_typed += 'k';
    }
    else if (clickX > (width/2 - 2.0*PPCM + 4.0*PPCM/3) && clickX < (width/2 - 2.0*PPCM + 2*(4.0*PPCM/3)) && clickY > (height/2) && clickY < (height/2 + 1.0*PPCM))
    {
      if (clickX == releaseX && clickY == releaseY) currently_typed += 'o';
      else if (clickX > releaseX && abs(clickX - releaseX) > abs(clickY - releaseY))       
        currently_typed += 'm';
      else if (clickX < releaseX && abs(clickX - releaseX) > abs(clickY - releaseY))       
        currently_typed += 'n';
      else if (clickY > releaseY && abs(clickY - releaseY) > abs(clickX - releaseX))  
        currently_typed += 'p';
      else if (clickY < releaseY && abs(clickY - releaseY) > abs(clickX - releaseX))  
        currently_typed += 'q';
    }
    else if (clickX > (width/2 - 2.0*PPCM + 2*(4.0*PPCM/3)) && clickX < (width/2 - 2.0*PPCM + 3*(4.0*PPCM/3)) && clickY > (height/2) && clickY < (height/2 + 1.0*PPCM))
    {
      if (clickX == releaseX && clickY == releaseY) currently_typed += 'r';
      else if (clickY > releaseY && abs(clickY - releaseY) > abs(clickX - releaseX))       
        currently_typed += 's';
      else if (clickY < releaseY && abs(clickY - releaseY) > abs(clickX - releaseX))  
        currently_typed += 't';
    }
    // Third Row
    if (clickX > (width/2 - 2.0*PPCM) && clickX < (width/2 - 2.0*PPCM + 4.0*PPCM/3) && clickY > (height/2 + 1.0*PPCM) && clickY < (height/2 + 2*(1.0*PPCM)))
    {
      if (clickX == releaseX && clickY == releaseY) currently_typed += 'u';
      else if (clickX < releaseX && abs(clickX - releaseX) > abs(clickY - releaseY))       
        currently_typed += 'w';
      else if (clickY > releaseY && abs(clickY - releaseY) > abs(clickX - releaseX))  
        currently_typed += 'v';
    }
    else if (clickX > (width/2 - 2.0*PPCM + 4.0*PPCM/3) && clickX < (width/2 - 2.0*PPCM + 2*(4.0*PPCM/3)) && clickY > (height/2 + 1.0*PPCM) && clickY < (height/2 + 2*(1.0*PPCM)))
    {
      if (clickX == releaseX && clickY == releaseY) currently_typed += ' ';
      else if (clickX > releaseX && abs(clickX - releaseX) > abs(clickY - releaseY) && currently_typed.length > 0)       
        currently_typed = currently_typed.substring(0, currently_typed.length - 1);
    }
    else if (clickX > (width/2 - 2.0*PPCM + 2*(4.0*PPCM/3)) && clickX < (width/2 - 2.0*PPCM + 3*(4.0*PPCM/3)) && clickY > (height/2 + 1.0*PPCM) && clickY < (height/2 + 2*(1.0*PPCM)))
    {
      if (clickX == releaseX && clickY == releaseY) currently_typed += 'y';
      else if (clickX > releaseX && abs(clickX - releaseX) > abs(clickY - releaseY))       
        currently_typed += 'x';
      else if (clickY > releaseY && abs(clickY - releaseY) > abs(clickX - releaseX))  
        currently_typed += 'z';
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
  
  current_letter       = 'a';
  
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
  text("Freebie errors: " + freebie_errors.toFixed(2), width / 2, height / 2 + h+40);
  text("Penalty: " + penalty.toFixed(2), width / 2, height / 2 + h+60);
  text("WPM with penalty: " + wpm_w_penalty.toFixed(2), width / 2, height / 2 + h+80);

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
    firebase.initializeApp(ourFirebase);
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