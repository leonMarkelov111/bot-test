const {Keyboard} = require("vk-io");

exports.backToWelcomeMenu = () => {
    return Keyboard.textButton({
        label: 'Назад',
        payload: {
            command: 'welcomeMenu'
        },
        color: Keyboard.NEGATIVE_COLOR
    })
}

exports.backToMainMenu = () => {
    return Keyboard.textButton({
        label: 'Вернуться назад',
        payload: {
            command: 'mainMenuScene'
        }
    })
}

exports.serverOnline = (msg) => {
    return Keyboard.textButton({
        label: 'Онлайн сервера',
        payload: {
            command: 'serverOnline',
            server: msg.messagePayload.server
        },
        color: Keyboard.PRIMARY_COLOR
    })
}

exports.setBotAdmin = () => {
    return Keyboard.textButton({
        label: 'Выдать доступ',
        payload: {
            command: 'setBotAdmin'
        },
        color: Keyboard.PRIMARY_COLOR
    })
}

exports.getBotAdmins = () => {
    return Keyboard.textButton({
        label: 'Список администраторов',
        payload: {
            command: 'getBotAdmins'
        },
        color: Keyboard.PRIMARY_COLOR
    })
}

exports.adminRights = () => {
    let massive = []
    let tmp = []
    let keys = Object.keys(userRight)
    for (const [i, el] of keys.entries()) {
        let color = Keyboard.SECONDARY_COLOR
        if(i === 0) color = Keyboard.NEGATIVE_COLOR
        if(i !== 8) {
            tmp.push(Keyboard.textButton({
                label: userRight[el].name,
                payload: {
                    lvl: userRight[el].lvl
                },
                color: color
            }))
            if(i % 3 === 0) {
                massive.push(tmp)
                tmp = []
            }
        }

        if(i+1 > keys.length - 1) {
            if(tmp !== []) {
                massive.push(tmp)
            }
        }
    }
    return massive
}

exports.globalMenu = () => {
    return Keyboard.textButton({
        label: 'Глобальные действия',
        payload: {
            command: 'globalMenu',
            type: 1
        },
        color: Keyboard.SECONDARY_COLOR
    })
}

exports.simpleMenu = () => {
    return Keyboard.textButton({
        label: 'Отдельные действия',
        payload: {
            command: 'simpleMenu',
            type: 2
        },
        color: Keyboard.SECONDARY_COLOR
    })
}

exports.adminBotMenu = () => {
    return Keyboard.textButton({
        label: 'Управление ботом',
        payload: {
            command: 'adminBotMenu'
        },
        color: Keyboard.PRIMARY_COLOR
    })
}

exports.adminMenu = () => {
    return Keyboard.textButton({
        label: 'Раздел для ГА',
        payload: {
            command: 'adminMenu'
        },
        color: Keyboard.SECONDARY_COLOR
    })
}

exports.sendSomeCommand = () => {
    return Keyboard.textButton({
        label: 'Ввести команду',
        payload: {
            command: 'sendSomeCommand'
        }
    })
}
