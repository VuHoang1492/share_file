const onRenderBrowserNotSupport = () => {
    window.location.replace('/not-support')
}

//Tạo 1 thẻ người dùng
const createCardUser = (user, client) => {
    const listCard = document.getElementById('main-view')
    if (user.type == 'ATHU') {
        listCard.innerHTML = '';
        let userCard = document.createElement('div')
        userCard.setAttribute('class', 'w-75 border-bottom my-1 mx-auto d-flex justify-content-between')
        userCard.setAttribute('id', `${user.id}`)
        userCard.innerHTML = `  <div class="d-flex">
                                    <img class="avatar" src="${user.avatar}">  
                                     <h6 class="my-auto mx-3">${user.name} (You) </h6>
                                </div>
                                `
        listCard.appendChild(userCard)

    }
    if (user.type == 'GUEST') {
        let guestCard = document.createElement('div')
        guestCard.setAttribute('class', 'w-75 border-bottom my-1 mx-auto d-flex justify-content-between position-relative')
        guestCard.setAttribute('style', `height:100px`)
        guestCard.setAttribute('id', `${user.id}`)
        guestCard.innerHTML = ` <div class="d-flex w-50"> 
                                    <img class="avatar my-auto" src="${user.avatar}">   
                                    <h6 class="my-auto mx-3">${user.name} </h6>
                                </div>
                                <div class="d-flex w-50">
                                <input class="mx-5 my-auto w-50 form-control form-control-sm" id="formFileSm" type="file" multiple>
                                <button class="mx-5 my-auto btn btn-outline-secondary">Send</button>
                                </div>`
        listCard.appendChild(guestCard)
        const btnSend = guestCard.getElementsByTagName('button')
        btnSend[0].addEventListener('click', () => {
            onSendSignal(user, client)
        })
    }
}


//Thông báo không có file
const onAlertNoFile = (userCard, user) => {
    const alert = document.createElement('div')
    alert.setAttribute('class', 'alert alert-danger position-absolute start-100 w-25 my-auto mx-1')
    alert.setAttribute('role', 'alert')
    alert.setAttribute('id', `alert-no-file-${user.id}`)
    alert.innerText = 'Upload a file before send....'
    userCard.appendChild(alert)
    setTimeout(() => {
        userCard.removeChild(alert)
    }, 5000);
}
//Thông báo đợi phản hồi bên nhận
const onWaitAccept = (userCard, user) => {
    const fileInput = userCard.getElementsByTagName('input');
    const btn = userCard.getElementsByTagName('button')
    const alert = document.createElement('div')
    alert.setAttribute('class', 'alert alert-primary position-absolute start-100 w-25 my-auto mx-1')
    alert.setAttribute('role', 'alert')
    alert.setAttribute('id', `alert-wait-${user.id}`)
    alert.innerHTML = `<small>Wait for ${user.name} accept</small>`
    userCard.appendChild(alert)
    fileInput[0].disabled = true
    btn[0].disabled = true
}

//thông báo có ngươi gửi file đến
const onGetRequestSend = (user, client, offer) => {
    const userCard = document.getElementById(user.id)
    const alert = document.createElement('div')
    const fileInput = userCard.getElementsByTagName('input');
    const btn = userCard.getElementsByTagName('button')
    fileInput[0].disabled = true
    btn[0].disabled = true
    alert.setAttribute('class', 'alert alert-primary position-absolute end-100 w-25 my-auto mx-1 h-100')
    alert.setAttribute('role', 'alert')
    alert.setAttribute('id', `alert-req-send-${user.id}`)
    alert.innerHTML = `<small >File from ${user.name}:</small>
                            <div class="w-100 d-flex h-75">
                                <button class="w-100 m-1 btn btn-outline-primary " id="accept"><small>Accept</small></button>
                                <button class="w-100 m-1 btn btn-outline-danger" id="decline"><small>Decline</small></button>
                            </div>`
    userCard.appendChild(alert)

    const btnInAlert = alert.getElementsByTagName('button')

    btnInAlert[0].addEventListener('click', () => {
        onAcceptGetFile(user, client, offer)
        userCard.removeChild(alert)
    })
    btnInAlert[1].addEventListener('click', () => {
        onDeclineGetFile(user, client)
        userCard.removeChild(alert)
    })

}
//Bên gửi nhận từ chối bên nhận
const onDecline = (user) => {
    const userCard = document.getElementById(user.id)
    const alert = document.getElementById(`alert-wait-${user.id}`)
    const fileInput = userCard.getElementsByTagName('input');
    const btn = userCard.getElementsByTagName('button')
    userCard.removeChild(alert)
    onDeclineCard(userCard, user)
    fileInput[0].disabled = false
    btn[0].disabled = false
}

//Thông báo từ chối nhận
const onDeclineCard = (userCard, user) => {
    const alert = document.createElement('div')
    alert.setAttribute('class', 'alert alert-danger position-absolute start-100 w-25 my-auto mx-1')
    alert.setAttribute('role', 'alert')
    alert.setAttribute('id', `alert-${user.id}`)
    alert.innerText = `${user.name} decline.`
    userCard.appendChild(alert)
    setTimeout(() => {
        userCard.removeChild(alert)
    }, 5000);
}

//BEN NHAN
const onReceving = (user) => {
    const userCard = document.getElementById(user.id)
    const fileInput = userCard.getElementsByTagName('input');
    const btn = userCard.getElementsByTagName('button')
    fileInput[0].disabled = true
    btn[0].disabled = true
    onRecvCard(userCard, user)
}
//thông báo đang nhận
const onRecvCard = (userCard, user) => {
    const alert = document.createElement('div')
    alert.setAttribute('class', 'alert alert-primary position-absolute start-100 w-25 my-auto mx-1')
    alert.setAttribute('role', 'alert')
    alert.setAttribute('id', `alert-recv-${user.id}`)
    alert.innerText = 'Receiving...'
    userCard.appendChild(alert)

}
const onSuccessRecv = (user) => {
    const userCard = document.getElementById(user.id)
    const alert = document.getElementById(`alert-recv-${user.id}`)
    const fileInput = userCard.getElementsByTagName('input');
    const btn = userCard.getElementsByTagName('button')
    userCard.removeChild(alert)
    fileInput[0].disabled = false
    btn[0].disabled = false
    onSuccessRecvCard(userCard, user)
}

//thông báo nhạn thành công
const onSuccessRecvCard = (userCard, user) => {
    const alert = document.createElement('div')
    alert.setAttribute('class', 'alert alert-success position-absolute start-100 w-25 my-auto mx-1')
    alert.setAttribute('role', 'alert')
    alert.setAttribute('id', `alert-${user.id}`)
    alert.innerText = 'Receive successfull...'
    userCard.appendChild(alert)
    setTimeout(() => {
        userCard.removeChild(alert)
    }, 5000);
}









//BEN GUI
const onSending = (user) => {
    const userCard = document.getElementById(user.id)
    const alert = document.getElementById(`alert-wait-${user.id}`)
    const fileInput = userCard.getElementsByTagName('input');
    const btn = userCard.getElementsByTagName('button')
    userCard.removeChild(alert)
    onSendCard(userCard, user)
}

//Thông báo đang gửi
const onSendCard = (userCard, user) => {
    const alert = document.createElement('div')
    alert.setAttribute('class', 'alert alert-primary position-absolute start-100 w-25 my-auto mx-1')
    alert.setAttribute('role', 'alert')
    alert.setAttribute('id', `alert-send-${user.id}`)
    alert.innerText = 'Sending...'
    userCard.appendChild(alert)

}
const onSuccess = (user) => {
    const userCard = document.getElementById(user.id)
    const alert = document.getElementById(`alert-send-${user.id}`)
    const fileInput = userCard.getElementsByTagName('input');
    const btn = userCard.getElementsByTagName('button')
    userCard.removeChild(alert)
    fileInput[0].disabled = false
    btn[0].disabled = false
    onSuccessCard(userCard, user)
}

//thông báo gửi thành công
const onSuccessCard = (userCard, user) => {
    const alert = document.createElement('div')
    alert.setAttribute('class', 'alert alert-success position-absolute start-100 w-25 my-auto mx-1')
    alert.setAttribute('role', 'alert')
    alert.setAttribute('id', `alert-decline-${user.id}`)
    alert.innerText = 'Send successfull...'
    userCard.appendChild(alert)
    setTimeout(() => {
        userCard.removeChild(alert)
    }, 5000);
}







onDeleteUserCard = (id) => {
    const listCard = document.getElementById('main-view')
    const userCard = document.getElementById(id)
    listCard.removeChild(userCard)
}


