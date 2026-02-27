/**
 * COMPLETE ASL ALPHABET LOGIC ENGINE
 * Handles all 26 letters (A-Z) based on MediaPipe Hand Landmarks.
 */

export const detectGesture = (landmarks) => {
    if (!landmarks || landmarks.length === 0) return "No Hand Detected";
  
    const getDist = (p1, p2) => Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
  
    // Landmark Shortcuts (Tip, PIP Joint, DIP Joint, MCP Joint)
    const thumb = [landmarks[4], landmarks[3], landmarks[2], landmarks[1]];
    const index = [landmarks[8], landmarks[7], landmarks[6], landmarks[5]];
    const middle = [landmarks[12], landmarks[11], landmarks[10], landmarks[9]];
    const ring = [landmarks[16], landmarks[15], landmarks[14], landmarks[13]];
    const pinky = [landmarks[20], landmarks[19], landmarks[18], landmarks[17]];
    const wrist = landmarks[0];
  
    // Basic Finger States (Extended vs Folded)
    const fUp = {
      i: index[0].y < index[2].y,
      m: middle[0].y < middle[2].y,
      r: ring[0].y < ring[2].y,
      p: pinky[0].y < pinky[2].y,
      t: thumb[0].y < index[3].y || getDist(thumb[0], index[3]) > 0.1
    };
  
    // --- 1. FULLY EXTENDED GESTURES ---
    // B: All fingers up and touching
    if (fUp.i && fUp.m && fUp.r && fUp.p && getDist(index[0], pinky[0]) < 0.2) return "B";
    
    // 5 / Open Palm: All fingers up and spread
    if (fUp.i && fUp.m && fUp.r && fUp.p && getDist(index[0], pinky[0]) > 0.2) return "5";
  
    // --- 2. POINTING & COMBINATIONS ---
    // D: Only index up, others touch thumb
    if (fUp.i && !fUp.m && !fUp.r && !fUp.p) {
        if (getDist(thumb[0], middle[0]) < 0.05) return "D";
    }
  
    // F: Thumb and Index touch, others up (OK sign)
    if (getDist(thumb[0], index[0]) < 0.05 && fUp.m && fUp.r && fUp.p) return "F";
  
    // L: Index and Thumb up (90 degrees)
    if (fUp.i && fUp.t && !fUp.m && !fUp.r && !fUp.p) return "L";
  
    // I: Only pinky up
    if (fUp.p && !fUp.i && !fUp.m && !fUp.r) return "I";
  
    // Y: Thumb and Pinky up (Hang Loose)
    // -------- Y (HIGH ACCURACY)

const thumbPinkyDist =
getDist(thumb[0], pinky[0]);

const indexFolded =
index[0].y > index[2].y;

const middleFolded =
middle[0].y > middle[2].y;

const ringFolded =
ring[0].y > ring[2].y;


// thumb + pinky spread apart

if(

thumbPinkyDist > 0.18 &&

fUp.p &&

indexFolded &&

middleFolded &&

ringFolded

){

return "Y";

}
    // V: Index and Middle up (spread)
    if (fUp.i && fUp.m && !fUp.r && !fUp.p && getDist(index[0], middle[0]) > 0.1) return "V";
  
    // U: Index and Middle up (touching)
    if (fUp.i && fUp.m && !fUp.r && !fUp.p && getDist(index[0], middle[0]) < 0.1) return "U";
  
    // W: Index, Middle, Ring up
    if (fUp.i && fUp.m && fUp.r && !fUp.p) return "W";
  
    // K: Index, Middle up, Thumb touching Middle joint
    if (fUp.i && fUp.m && getDist(thumb[0], middle[1]) < 0.05) return "K";
  
    // --- 3. CURVED & CIRCULAR ---
    // C: Curved hand
    const thumbIndexDist = getDist(thumb[0], index[0]);
    if (thumbIndexDist > 0.15 && !fUp.i && !fUp.m && !fUp.r && !fUp.p && index[0].x < index[2].x) return "C";
  
    // O: All tips meeting thumb
    if (getDist(thumb[0], index[0]) < 0.05 && getDist(thumb[0], middle[0]) < 0.05 && !fUp.i) return "O";
  
    // --- 4. FIST VARIATIONS (The hard ones) ---
    if (!fUp.i && !fUp.m && !fUp.r && !fUp.p) {
      // A: Thumb on the side of index
      if (thumb[0].x < index[3].x && thumb[0].y < index[2].y) return "A";
      
      // T: Thumb tucked between index and middle
      if (thumb[0].x > index[2].x && thumb[0].x < middle[2].x) return "T";
      
      // N: Thumb tucked between middle and ring
      if (thumb[0].x > middle[2].x && thumb[0].x < ring[2].x) return "N";
      
      // M: Thumb tucked between ring and pinky
      if (thumb[0].x > ring[2].x) return "M";
  
      // E: Fingers folded tight, thumb tucked under
      if (thumb[0].y > index[0].y && thumb[0].y > middle[0].y) return "E";
  
      // S: Thumb tucked across the front of all fingers
      if (thumb[0].x > index[1].x && thumb[0].y > index[1].y) return "S";
    }
  
    // --- 5. COMPLEX SHAPES ---
    // G: Index and thumb pointing horizontally (pointing at each other)
    if (fUp.i && !fUp.m && Math.abs(index[0].y - thumb[0].y) < 0.1) return "G";
  
    // H: Index and Middle pointing horizontally
    if (fUp.i && fUp.m && !fUp.r && Math.abs(index[0].y - middle[0].y) < 0.05) return "H";
  
    // P: Same as K but pointing down (wrist orientation check)
    if (index[0].y > wrist.y && fUp.m) return "P";
  
    // Q: Same as G but pointing down
    if (index[0].y > wrist.y && !fUp.m && !fUp.r) return "Q";
  
    // X: Index finger hooked (bent)
    if (!fUp.i && index[0].y < index[3].y && getDist(index[0], index[3]) < 0.1) return "X";
  
    // R: Index and Middle crossed
    if (fUp.i && fUp.m && index[0].x > middle[0].x) return "R";
  
    return "Scanning...";
  };