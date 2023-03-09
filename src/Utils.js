/**
 * Log input to the console separated by tabs
 */
export function logTabSep() {
    console.log(Array.prototype.slice.call(arguments).join('\t>'));
}

/**
 * Convert time to a readable form
 * With minutes/seconds/ms separated by a colon and period
 * Minutes show only if the time is above 60 seconds
 * @param {Number} time in ms
 * @returns time in a human readable form
 */
export function msToReadable(time) {
    let minutes = "";
    if (time >= 60000)
        minutes = (("0" + Math.floor((time / 60000) % 60)).slice(-2) + ":");

    const seconds = ("0" + Math.floor((time / 1000) % 60)).slice((time >= 10000) ? -2 : -1) + ".";
    const ms = ("0" + Math.floor((time / 10) % 100)).slice(-2);
    return minutes + seconds + ms;
}

/**
 * Take an algorithm and reverse
 * If you perform the intial algorithm on a cube then perform the inverse scramble, the cube will not change
 * @param {string} s initial scramble
 * @returns inverse scramble/algorithm
 */
export function inverseScramble(s) {
    // deleting parentheses and double spaces
    s = s.replaceAll('[', " ");
    s = s.replaceAll(']', " ");
    s = s.replaceAll('(', " ");
    s = s.replaceAll(')', " ");
    while(s.indexOf("  ") !== -1)
        s = s.replaceAll("  ", " ");

    let arr = s.split(" ");
    let result = "";
    for (const move of arr) {
        if (move.length === 0)
            continue;
        // For double turns like U2, just flip the order of the 2 and the face letter
        if (move[move.length - 1] === '2')
            result = move + " " + result;
        // For prime turns like U', remove the ' to reverse it
        else if (move[move.length - 1] === '\'')
            result = move.substring(0, move.length - 1) + " " + result;
        // For regular moves like U, prepend the ' to reverse it
        else
            result = move + "' " + result;
    }

    return result.substring(0, result.length-1);
}

/**
 * http://stackoverflow.com/questions/15604140/replace-multiple-strings-with-multiple-other-strings
 * Replace strings in strings according to a given mapping
 * @param {string} str 
 * @param {Object} mapObj object describing strings to replace
 * @returns Modified string
 */
export function replaceAll(str,mapObj) {
    if (!mapObj)
        return str;
    
    // Join mapping keys together with | to search for matching strings to replace
    // g flag: global, replace all matches
    // i flag: ignore case
    let re = new RegExp(Object.keys(mapObj).join("|"),"gi");

    return str.replace(re, function(matched){
        return mapObj[matched];
    });
}

/**
 * Rotate an algorithm around the vertical axis accordingly
 * @param {string} alg 
 * @param {string} rot type of rotation to apply to algorithm using cubing notation
 * @returns algorithm rotated
 */
// returns new string with transformed algorithm.
// Returnes sequence of moves that get the cube to the same position as (alg + rot) does, but without cube rotations.
// Example: applyAlgRotation("R U R'", "y") = "F U F'"
export function applyAlgRotation(alg, rot) {
    let mapObj;
    if (rot==="y")
        mapObj = {R:"F",F:"L",L:"B",B:"R"};
    if (rot==="y'")
        mapObj = {R:"B",B:"L",L:"F",F:"R"};
    if (rot==="y2")
        mapObj = {R:"L",L:"R",B:"F",F:"B"};

    return replaceAll(alg, mapObj);
}

/**
 * Increment a string specifying rem units
 * @param {String} rem Initial rem value
 * @param {Number} increment Increment (should be positive/negative)
 */
export function incrementRem(rem, increment) {
    rem = Number(rem.slice(0, -3));
    rem += increment;
    return String(rem).concat('rem');
}