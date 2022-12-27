export function msToReadable(time) {
    let minutes = "";
    if (time >= 60000)
        minutes = (("0" + Math.floor((time / 60000) % 60)).slice(-2) + ":");

    const seconds = ("0" + Math.floor((time / 1000) % 60)).slice((time >= 10000) ? -2 : -1) + ".";
    const ms = ("0" + Math.floor((time / 10) % 100)).slice(-2);
    return minutes + seconds + ms;
}

export function logTabSep() {
    console.log(Array.prototype.slice.call(arguments).join('\t'));
}