

function set_track(tracker, index){
    track = document.getElementById(tracker)
    track.children[index].style.margiBottom = '200px'

    console.log('carousel: ' + track.children[index].style.top)

}