let currentsong = new Audio;
let songs;
let currentfolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getsongs(folder) {
    currentfolder = folder
    let a = await fetch(`/${folder}/`)
    // console.log(a)
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")

    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }
    let songsUL = document.querySelector(".your_songs_container").getElementsByTagName("ul")[0]
    songsUL.innerHTML = ""
    for (const song of songs) {
        songsUL.innerHTML += `
        <li class="flex align_items">
        <div class="info__icon flex align_items">
            <img src="/utils/logo/music_icon.svg" alt="">
            <div class="music_info">
                <div>${song.replaceAll("%20", " ")}</div>
                <div>song artist</div>
            </div>
        </div>
        <div class="play_now flex align_items justify_content">
            <span>Play now</span>
            <img class="invert" src="/utils/logo/playsong.svg" alt="">
        </div>
    </li>`
    }

    Array.from(document.querySelector(".your_songs_list").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            playmusic(e.querySelector(".music_info").firstElementChild.innerHTML.trim())
        })
    })

    return songs
}

const playmusic = (track, pause = false) => {
    // let audio = new Audio("/songs/" + track)
    currentsong.src = `/${currentfolder}/` + track
    if (!pause) {
        currentsong.play()
        play.querySelector("img").src = "/utils/logo/pausesong.svg"
    }
    document.querySelector(".songinfo").innerHTML = `<p>${track.replaceAll("%20", " ")}</p>`
    document.querySelector(".songduration").innerHTML = "00:00/00:00"

}


async function DisplayAlbumsAndSongs() {
    let a = await fetch(`/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let all_a = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".all_card_container");
    let array_of_as = Array.from(all_a);
    for (let index = 0; index < array_of_as.length; index++) {
        const e = array_of_as[index];

        if (e.href && e.href.includes("/songs/")) {
            let folder_name = e.href.split("/songs/")[1].split("/")[0];
            console.log("Folder Name:", folder_name);
            let a = await fetch(`songs/${folder_name}/info.json`)
            let response = await a.json();
            // console.log(response.title, response.description);
            cardContainer.innerHTML += `
            <div data-folder="${folder_name}" class="card_container flex column  align_items justify_content bradius">
                                
            <div class="card flex column align_items justify_content">
            <div class="play_button_container">
                <button class="play_button">
                    <span class="flex align_items justify_content"><img
                            src="/utils/logo/playbutton.svg" alt=""></span>
                </button>
            </div>
            <img class="bradius"
                src="/songs/${folder_name}/cover.jpg" alt="">
            <h2>${response.title}</h2>
            <p>${response.description}</p>
        </div>
            </div>`;
        }
    }

    Array.from(document.getElementsByClassName("card_container")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`);
            playmusic(songs[0])
        })
    })
}








//-------------------------------------------------------------MAIN---------------------------------------------








async function main() {

    await getsongs("songs/juicewrld");
    
    playmusic(songs[0],true)

    DisplayAlbumsAndSongs()

    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play()
            play.querySelector("img").src = "/utils/logo/pausesong.svg"
        }
        else {
            currentsong.pause()
            play.querySelector("img").src = "/utils/logo/playsong.svg"
        }
    })

    currentsong.addEventListener("timeupdate", () => {
        // console.log(currentsong.currentTime, currentsong.duration);
        document.querySelector(".songduration").innerHTML = `${secondsToMinutesSeconds(currentsong.currentTime)} / ${secondsToMinutesSeconds(currentsong.duration)}`
        document.querySelector(".circle_ticker").style.left = `${currentsong.currentTime / currentsong.duration * 100}%`
        if (currentsong.ended) {
            play.querySelector("img").src = "/utils/logo/playsong.svg"
            document.querySelector(".circle_ticker").style.left = "-1%";
        }
    })

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle_ticker").style.left = percent + "%";
        currentsong.currentTime = (percent * currentsong.duration) / 100
    })

    let clicked = false
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
        document.querySelector(".closing_hamburger").style.display = "flex";
        document.querySelector(".login_btn").style.display = "none";
        clicked = true
    })

    document.querySelector(".closing_hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%";
        document.querySelector(".closing_hamburger").style.display = "none";
        document.querySelector(".login_btn").style.display = "flex";
    })

    previous.addEventListener("click", () => {
        currentsong.pause();
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
        if (index === 0 || index === -1) {
            playmusic(songs[songs.length - 1]);
        } else {
            playmusic(songs[index - 1]);
        }
    });
    
    next.addEventListener("click", () => {
        currentsong.pause();
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
        if (index === songs.length - 1 || index === -1) {
            playmusic(songs[0]);
        } else {
            playmusic(songs[index + 1]);
        }
    });
    
    document.querySelector(".volume").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log(e.target.value)
        currentsong.volume = e.target.value / 100
    })

    document.querySelector(".volume_img").addEventListener("click", (e) => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentsong.volume = 0;
            document.querySelector(".volume").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentsong.volume = 1;
            document.querySelector(".volume").getElementsByTagName("input")[0].value = 100;
        }
    })

    currentsong.addEventListener("ended", () => {
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
        if (index < songs.length - 1) {
            playmusic(songs[index + 1]);
        } else {
            playmusic(songs[0]);
        }
    });
    
}
main()
