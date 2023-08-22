const musicBoxes = document.querySelectorAll('.music-box');
const nowPlayingCover = document.querySelector('.now-playing .album-cover');
const nowPlayingLyrics = document.querySelector('.now-playing .lyrics');
const nowPlayingTitle = document.querySelector('.now-playing .song-title');
const player = document.getElementById('player');

let currentLyrics = [];
let currentLineIndex = 0;

async function fetchLyrics(url) {
    const response = await fetch(url);
    const text = await response.text();
    const lines = text.split('\n');

    let lyricsArray = [];
    for (let line of lines) {
        const match = line.match(/\[(\d+):(\d+\.\d+)\](.+)/);
        if (match) {
            const minutes = parseFloat(match[1]);
            const seconds = parseFloat(match[2]);
            const time = minutes * 60 + seconds;
            lyricsArray.push({ time, text: match[3] });
        }
    }
    return lyricsArray;
}

musicBoxes.forEach((box) => {
    if (box.classList.contains('now-playing')) return;

    const cover = box.querySelector('.album-cover');
    const songURL = box.dataset.songUrl;
    const lyricsURL = box.dataset.lyricsUrl;
    const songTitle = box.querySelector('.song-title').textContent;

    box.addEventListener('click', async function() {
        player.src = songURL;
        player.play();

        nowPlayingCover.style.backgroundImage = cover.style.backgroundImage;
        nowPlayingTitle.textContent = songTitle;

        currentLyrics = await fetchLyrics(lyricsURL);
        currentLineIndex = 0;

        player.ontimeupdate = () => {
            while (currentLyrics[currentLineIndex + 1] && player.currentTime > currentLyrics[currentLineIndex + 1].time) {
                currentLineIndex++;
            }

            if (player.currentTime > currentLyrics[currentLineIndex].time) {
                nowPlayingLyrics.textContent = currentLyrics[currentLineIndex].text;
                nowPlayingLyrics.style.animationPlayState = 'running';
            }
        };

        player.onended = () => {
            nowPlayingLyrics.textContent = "当前未播放歌曲";
            nowPlayingLyrics.style.animationPlayState = 'paused';
        };
    });
});
