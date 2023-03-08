export function msToReadable(time) {
    let minutes = "";
    if (time >= 60000)
        minutes = (("0" + Math.floor((time / 60000) % 60)).slice(-2) + ":");

    const seconds = ("0" + Math.floor((time / 1000) % 60)).slice((time >= 10000) ? -2 : -1) + ".";
    const ms = ("0" + Math.floor((time / 10) % 100)).slice(-2);
    return minutes + seconds + ms;
}

export function logTabSep() {
    console.log(Array.prototype.slice.call(arguments).join('\t>'));
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