const userModel = require ('../models/userSchema')
const convModel = require ('../models/convSchema')
const punishModel = require ('../models/punishSchema')
const blackListModel = require ('../models/blackListSchema')
const globalUser = require ('../models/globalUserSchema')
const logger = require('./logger')

exports.checkConvUsersInDB = async (convID) => {
    let vkArray = await vk.api.messages.getConversationMembers({
        peer_id: convID,
    });

    let query = [];
    let userInDb = await userModel.find({ 'convID': { $in: convID } });
    for (let i = 0; i < vkArray.count; i++) {
        let result = userInDb.find(s => s.userID === vkArray.items[i].member_id)
        if(result) continue
        if (vkArray.items[i].member_id > 0) {
            if(vkArray.items[i].is_owner === true) {
                query.push({userID: vkArray.items[i].member_id, convID: convID, admin: 3})
            } else {
                query.push({userID: vkArray.items[i].member_id, convID: convID})
            }
        }
    }

    //console.log(query)

    try {
        await userModel.insertMany(query,{ ordered: false });
        //console.log(response)
    } catch (e) {
        console.log(e);
    }
}

const getUserInfo = async (msg, id) => {
    return await vk.api.users.get({
        user_ids: id,
    })
}

exports.convUserAdd = async (msg, userID, convID) => {
    let user = await userModel.findOne({userID: userID, convID: convID})

    if (user) {
        return user;
    } else {
        let user = await userModel.create({
            userID: userID,
            convID: convID
        })
        await user.save()
        user = await userModel.findOne({userID: userID})
        return user
    }
}

exports.getUserFromMongo = async(userID, convID) => {
    return userModel.findOne({userID: userID, convID: convID});
}

exports.checkBotAdmins = async(userID) => {
    return globalUser.findOne({userID: userID});
}
exports.getUserConvsFromMongo = async(userID, server, type) => {
    let result = []
    let user = await userModel.find({userID: userID})
    let convs
    if(type > 1) convs = await convModel.find({type: type, server: server})
    else if(type === 1) convs = await convModel.find({server: server})
    else return false

    if(server === null) convs = await convModel.find({status: 1})

    for(let el of user) {
        let status = convs.find(s => s.convID === el.convID)
        if(status) result.push(el)
    }
    return result
}

exports.getUserPunish = async(userID, convID) => {
    return punishModel.find({userID: userID, convID: convID}).limit(10);
}

exports.convAdd = async (convID) => {
    let conv = await convModel.findOne({convID: convID})
    //console.log(conv.convID)
    if (conv) {
        return true;
    } else {
        let conv = await convModel.create({
            convID: convID
        })
        await conv.save()
    }
    return true
}

exports.convDelete = async (convID) => {
    await convModel.deleteOne({convID: convID})
    await userModel.deleteMany({convID: convID})
    return true
}

exports.setActiveChat = async (convID) => {
    await convModel.findOneAndUpdate({convID: convID}, {status: 1, type: 1}, {upsert: true, new: true})
    return true
}

exports.setChatModerator = async (convID, userID, lvl) => {
    await userModel.findOneAndUpdate({convID: convID, userID: userID}, {admin: lvl}, {upsert: true, new: true})
    return true
}

exports.getAdminBot = async(userID) => {
    return globalUser.findOne({userID: userID});
}

exports.setBotAdmin = async (userID, lvl) => {
    if(lvl === 0) await userModel.findOneAndUpdate({userID: userID}, {admin: 0}, {upsert: true})
    if(lvl > 2 && lvl < 6) await userModel.findOneAndUpdate({userID: userID}, {admin: 2}, {upsert: true})
    if(lvl > 5) await userModel.findOneAndUpdate({userID: userID}, {admin: 3}, {upsert: true})
    return globalUser.findOneAndUpdate({userID: userID}, {admin: Number.parseInt(lvl)}, {upsert: true, new: true});
}

exports.setUserNick = async (convID, userID, nick) => {
    return globalUser.findOneAndUpdate({userID: userID}, {nickName: nick}, {upsert: true, new: true});
}

exports.getConvInfo = async (convID) => {
    return convModel.findOne({convID: convID});
}

exports.setConvType = async (convID, type) => {
    return convModel.findOneAndUpdate({convID: convID}, {type: type, server: 1}, {upsert: true, new: true});
}

exports.setSilenceStatus = async (convID, status) => {
    return convModel.findOneAndUpdate({convID: convID}, {silence: status}, {upsert: true, new: true});
}

exports.getConvs = async () => {
    return convModel.find();
}

exports.getAdminsChat = async (convID) => {
    return userModel.find({convID: convID, admin: {$gt: 0}});
}

exports.getUserBan = async (msg, userID, convID) => {
    let userBan = await userModel.findOne({userID: userID, convID: convID})
    //console.log(userBan)
    return userBan.ban
}

exports.getUserWarns = async (msg, userID, convID) => {
    let userWarns = await userModel.findOne({userID: userID, convID: convID})
    return userWarns.warns
}

exports.setUserBan = async (userID, convID, reason) => {
    await userModel.findOneAndUpdate({userID: userID, convID: convID}, {ban: true, banReason: reason, warns: 0}, {upsert: true, new: true})
}

exports.setUserUnBan = async (userID, convID) => {
    await userModel.findOneAndUpdate({userID: userID, convID: convID}, {ban: false, banReason: '', warns: 0}, {upsert: true, new: true})
}

exports.addUserWarn = async (userID, convID) => {
    await userModel.findOneAndUpdate({userID: userID, convID: convID}, {$inc: { "warns" : 1 }}, {upsert: true, new: true})
}

exports.addUserMuteWarn = async (userID, convID) => {
    await userModel.findOneAndUpdate({userID: userID, convID: convID}, {$inc: { "muteWarning" : 1 }}, {upsert: true, new: true})
}

exports.deleteUserMuteWarn = async (userID, convID) => {
    await userModel.findOneAndUpdate({userID: userID, convID: convID}, {muteWarning: 0 }, {upsert: true, new: true})
}

exports.setUserMute = async (userID, convID, time) => {
    await userModel.findOneAndUpdate({userID: userID, convID: convID}, {mute: true, $inc: { "muteTime" : time }}, {upsert: true, new: true})
}

exports.setUserUnMute = async (userID, convID) => {
    await userModel.findOneAndUpdate({userID: userID, convID: convID}, {mute: false, muteTime: 0}, {upsert: true, new: true})
}

exports.muteTimeCheck = async () => {
    await userModel.findOneAndUpdate({muteTime: { $gt: 0 } }, {$inc: { muteTime: -1 }})
    let result = await userModel.find({muteTime: 0, mute: true})

    if (result !== undefined) {
        for (let i = 0; i < result.length; i++) {
            //console.log(result[i])
            await userModel.findOneAndUpdate({userID: result[i].userID, convID: result[i].convID, mute: true}, {mute: false, muteWarning: 0 })
            await vk.api.messages.send({
                random_id: 0,
                peer_id: result[i].convID,
                message: `У @id${result[i].userID}(пользователя) закончилась затычка.`
            });
        }
    }
}

exports.kickUserFromChat = async (convId, userId) => {
    try {
        await vk.api.messages.removeChatUser({
            chat_id: convId - 2000000000,
            user_id: userId
        })
        return true
    } catch (err) {
        if (err) {
            logger.error.error(`${err.message} | ${convId}`)
            return false
        }
    }
}

exports.getConvRankName = async (user) => {
    if(user.nickName.length > 1) return user.nickName
    if(user.admin === 1) return "Модератор беседы"
    if(user.admin === 2) return "Администратор беседы"
    if(user.admin === 3) return "Руководство"
    return "Игрок"
}

exports.getRankName = async (user) => {
    if(user.nickName.length > 1) return user.nickName
    if(user.admin === 1) return "Администратор сервера"
    if(user.admin === 2) return "Технический администратор"
    if(user.admin === 3) return "Куратор сервера"
    if(user.admin === 4) return "ЗГА сервера"
    if(user.admin === 5) return "ГА сервера"
    if(user.admin === 6) return "Команда проекта"
    if(user.admin === 7) return "Разработчик бота"
    return "Игрок"
}

exports.getUserIdForPunishment = async (msg) => {
    let regex = /id(\d+)/;
    let match = regex.exec(msg.text.split(' ').slice(1).join(' '));

    let userID
    let status = false

    if (match === null) {
        let regex = /https:\/\/vk.com\/(.+\w)/y;
        let match = regex.exec(msg.text.split(' ').slice(1).join(' '));
        logger.info.info(match)

        if (match) {
            let userInfo = await getUserInfo(msg, match[1])
            logger.info.info(userInfo[0].id)
            userID = userInfo[0].id
        }
    } else {
        userID = match[1]
    }

    logger.info.info(match)
    if (userID === null) {
        userID = msg.fwds[0] ? msg.fwds[0].senderId : msg.text.split(' ')[1];
        status = true
    }

    if (msg.replyMessage) {
        userID = msg.replyMessage.senderId;
        status = true
    }
    logger.info.info(`ID - ${userID}`)
    if (userID === null) {

    }
    userID = Number.parseInt(userID)
    return { userID, status}
}


exports.getUserIdForScenes = async function (msg) {
    let regex = /id(\d+)/;
    let match = regex.exec(msg.text);

    let userID

    if (match === null) {
        let regex = /https:\/\/vk.com\/(.+\w)/y;
        let match = regex.exec(msg.text);
        logger.info.info(match)

        if (match) {
            let userInfo = await getUserInfo(msg, match[1])
            logger.info.info(userInfo[0].id)
            userID = userInfo[0].id
        }
    } else {
        console.log(`${match} + asd`)
        userID = match[1]
    }

    return userID
}

exports.checkAdminAndOwner = async (msg, vkArray, userID) => {
    let owner = vkArray.items.find(s => s.is_owner === true)
    let admin = vkArray.items.find(s => s.is_admin === true && s.member_id === userID)

    let status1 = false
    if(admin !== undefined && msg.senderId !== owner.member_id) status1 = true
    if(userID === owner.member_id) status1 = true

    //console.log(status1)
    return { owner, status1}
}

exports.setPunishHistory = async (userID, giveID, convID, type, reason) => {
    let time = new Date().toLocaleTimeString("ru-RU", {timeZone: "Europe/Moscow", hour12: false})
    let date = new Date().toLocaleDateString("ru-RU", {timeZone: "Europe/Moscow", hour12: false})

    let punish = await punishModel.create({
        userID: userID,
        giveID: giveID,
        convID: convID,
        type: type,
        reason: reason,
        date: date,
        time: time
    })
    await punish.save()
    //console.log(punish)
}

exports.addUserToBlackList = async (userID, giverID, reason, server) => {
    if(server !== null) {
        await blackListModel.findOneAndUpdate({userID: userID, server: server}, {giverID: giverID, reason: reason}, {upsert: true, new: true})
    } else {
        await blackListModel.findOneAndUpdate({userID: userID, server: 0}, {giverID: giverID, reason: reason}, {upsert: true, new: true})
    }
}

exports.checkUserInBlackList = async (userID) => {
    return blackListModel.findOneAndDelete({userID: userID}, {upsert: true, new: true});
}

exports.getAdmins = async function () {
    let result = await globalUser.find({admin: { $gte: 1 }})
    console.log(result)
    return result
}

exports.getConvUsers = async function (convID) {
    return userModel.find({convID: convID});
}

// function dateFormat () {
//     let datetime = new Date();
//     let dateString = new Date(
//         datetime.getTime() - datetime.getTimezoneOffset() * 60000
//     );
//     return dateString.toISOString().replace("T", " ").substr(0, 19);
// }

exports.getUserInfo = getUserInfo
