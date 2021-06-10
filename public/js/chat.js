let userId = localStorage.getItem('userId')

const socket = io({
    transports: ['websocket'],
    autoConnect: true
});

let page = 1;
let mainWindow = document.getElementById('main-window');

socket.emit('home', userId)

socket.on('receiveMsg', data => {
    receiveMessage(data.roomId, data.from, data.avatar, data.name, data.content, data.img)
})

sendMessage = (roomId, from) => {
    let content = document.getElementById("content").textContent;
    let imgPreview = document.getElementsByClassName("sentImg");
    if (content != null)
        socket.emit('sendMsg', {roomId, from, content, img: ''})
    document.getElementById("content").textContent = ''
    for (let img of imgPreview) {
        socket.emit('sendMsg', {roomId, from, content: '', img: img.src})
    }
    document.getElementById('imgPreview').innerHTML = ''
}

receiveMessage = (roomId, from, avatar, name, content, img) => {
    let listMessage = document.getElementById('listMessage')
    if (listMessage.dataset.roomId === roomId) {
        if (from === userId) {
            displayMyMessage(avatar, content, img, name)
        } else displayOtherMessage(avatar, content, img, name)
    }
}

displayMyMessage = (avatar, content, img, name) => {
    let display = (content !== '') ? content : `<img src="${img}" alt="img"/>`
    document.getElementById('listMessage').innerHTML +=
        `<li class="chat-right">
            <div class="chat-hour">${getTimeNow()}</div>
            <div class="chat-text">${display}</div>
            <div class="chat-avatar">
                <img src="${avatar}" alt="Avatar">
                <div class="chat-name">${name}</div>
            </div>
        </li>`
    scrollToBottom()
}

displayOtherMessage = (avatar, content, img, name) => {
    let display = (content !== '') ? content : `<img src="${img}" alt="img"/>`
    document.getElementById('listMessage').innerHTML +=
        `<li class="chat-left">
            <div class="chat-avatar">
                <img src="${avatar}" alt="Avatar">
                <div class="chat-name">${name}</div>
            </div>
            <div class="chat-text">${display}</div>
            <div class="chat-hour">${getTimeNow()}</div>
        </li>`
    scrollToBottom()
}

openChatWindow = async (roomId, name, isGroup) => {
    mainWindow.innerHTML = generateChatWindow(roomId, name, isGroup);
    await getMessagesHistory(roomId, 1);
    await getMessagesHistory(roomId, 2);
    page = 3
    scrollToBottom()
    registerEvent(roomId, isGroup)
}

registerEvent = (roomId, isGroup) => {
    document.getElementById('sendBtn').addEventListener('click', () => {
        sendMessage(roomId, userId)
    })
    document.getElementById('content').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            document.getElementById('sendBtn').click()
        }
    })
    let inputImg = document.getElementById('input-img');
    inputImg.oninput = () => {
        for (let img of inputImg.files) {
            const reader = new FileReader();
            reader.addEventListener("load", () => {
                showImgPreview(reader.result);
            }, false);
            reader.readAsDataURL(img);
        }
    }

    let listMessage = document.getElementById('listMessage')
    listMessage.onscroll = async () => {
        if (listMessage.scrollTop === 0) {
            await getMessagesHistory(roomId, page)
            page++
        }
    }

    if (isGroup) {
        document.getElementById('out-btn').addEventListener('click', () => {
            fetch(`/out/${roomId}`).then(res => window.location.reload())
        })

        document.getElementById('share-btn').addEventListener('click', () => {
            let temp = document.createElement('textarea')
            temp.value = `http://localhost:8082/join/${roomId}`;
            document.body.appendChild(temp)
            temp.select()
            document.execCommand('copy')
            document.body.removeChild(temp)
        })
    }
}

generateChatWindow = (roomId, name, isGroup) => {
    let groupBonusBtn = '';
    if (isGroup) groupBonusBtn +=
        `
        <button id="out-btn" class="btn btn-danger" style="right: 0; position: absolute;top: 10px;">
            <i class="fas fa-sign-out-alt"></i>
        </button>
        <button id="share-btn" class="btn btn-success" style="right: 50px; position: absolute;top: 10px;">
            <i class="fas fa-share-alt-square"></i>
        </button>
        `
    return (
        `<div class="selected-user">
            <span>To: <span class="name">${name}</span></span>
            ${groupBonusBtn}
        </div>
        <div class="chat-container">
            <ul id="listMessage" data-room-id="${roomId}" class="chat-box chatContainerScroll"></ul>
            <div id="imgPreview" class="img-preview row"></div>
            <div class="input-group">
                <span class="input-group-text btn-primary" style="cursor: pointer" onclick="document.getElementById('input-img').click()">
                    <i class="fas fa-images"></i>
                    <input id="input-img" type="file" accept="image/*" multiple style="display: none"/>
                </span>
                <div id="content" contenteditable="true" class="form-control" data-placeholder="Type your message here..."></div>
                <span id ="sendBtn" class="input-group-text btn-primary" style="cursor: pointer">Send</span>
            </div>
        </div>`
    )
}

getMessagesHistory = async (roomId, page) => {
    let response = await fetch(`/messages/${roomId}/${page}`)
    let html = await response.text();
    document.getElementById('listMessage').insertAdjacentHTML('afterbegin', html)
}

scrollToBottom = () => {
    let listMessage = document.getElementById('listMessage')
    listMessage.scrollTop = listMessage.scrollHeight
}

showImgPreview = (imgSrc) => {
    document.getElementById('imgPreview').innerHTML +=
        `<div class="img-wrap col">
            <span class="close fas fa-times-circle" onclick="this.parentNode.remove()"></span>
            <img class="sentImg" src="${imgSrc}" alt="Avatar">
        </div>`
}

getTimeNow = () => {
    let now = new Date(Date.now())
    return `${now.getHours()}:${now.getMinutes()}`
}

// ----------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------
let members = [userId]

document.getElementById('newGroup').addEventListener('click', async () => {
    let response = await fetch('/create-form')
    mainWindow.innerHTML = await response.text();

    let img = document.getElementById('group-img')
    let name = document.getElementById('group-name')

    let inputGroupImg = document.getElementById('input-group-img');
    inputGroupImg.oninput = () => {
        for (let image of inputGroupImg.files) {
            const reader = new FileReader();
            reader.addEventListener("load", () => {
                img.src = reader.result
            }, false);
            reader.readAsDataURL(image);
        }
    }
    let checkBoxes = document.querySelectorAll('input[type=checkbox]')
    for (let checkBox of checkBoxes) {
        checkBox.addEventListener('click', () => {
            if (checkBox.checked) members.push(checkBox.value)
            else members = members.filter(m => m !== checkBox.value)
            document.getElementById('save-btn').disabled = members.length < 3;
        })
    }

    document.getElementById('save-btn').addEventListener('click', () => {
        fetch('/group', {
            method: 'POST',
            redirect: 'manual',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: name.textContent,
                avatar: img.src,
                members: members
            }),
        }).then(response => {
                window.location.reload()
            }
        )
    })

})


