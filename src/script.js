// Description:
//   Save and retrieve all commands sent to hubot.
//
// Configuration:
// HUBOT_COMMAND_LOG_OUTPUT_ROOM - Room where the log will be printed.
//
// Commands:
//   hubot command-log 2016/12/31 - Get all commands given to hubot during that day.
//   hubot command-log 2016/12/01-2016/12/31 - Get all commands given to hubot during that range of dates
//
// Author:
//   @gmq

const process = require('process')
const moment = require('moment')

let outputRoom = process.env.HUBOT_COMMAND_LOG_OUTPUT_ROOM

module.exports = (robot) => {
  robot.listenerMiddleware((context, next, done) => {
    const logs = robot.brain.get('hubot-command-log') || []
    const newLog = Object.assign({}, context.response.message, { date: new Date() })
    delete newLog.rawMessage;
    logs.push(newLog)
    robot.brain.set('hubot-command-log', logs)
    robot.brain.save()
    next()
  })

  robot.respond(/command-log ([^-]+)-?([^-]+)?$/, (res) => {
    const validDateFormats = ['YYYY/MM/DD hh:mm', 'YYYY/MM/DD', 'hh:mm']
    const rangeStart = moment(res.match[1], validDateFormats)
    const rangeEnd = (res.match[2]) ? moment(res.match[2], validDateFormats, 'es') : rangeStart.clone().endOf('day')

    if (!rangeStart.isValid()) {
      return res.send(`I can't understand that date, try using the following formats: ${validDateFormats.join(', ')}.
        Example: 2016/12/30 12:00 - 2016/12/30 17:00`)
    }

    const logs = robot.brain.get('hubot-command-log') || []
    const foundLogs = getLogs(rangeStart, rangeEnd, logs)
    if (foundLogs.length > 0) {
      const parsedLogs = parseLogs(foundLogs, robot)
      if (outputRoom) {
        robot.messageRoom(outputRoom, parsedLogs)
      } else {
        res.send(parsedLogs)
      }
    } else {
      res.send(`No logs found for specified range ${rangeStart.format('YYYY/MM/DD hh:mm')} - ${rangeEnd.format('YYYY/MM/DD hh:mm')}`)
    }
  })
}

function getLogs (rangeStart, rangeEnd, logs) {
  return logs.filter(log => {
    return rangeStart.isSameOrBefore(log.date) && rangeEnd.isSameOrAfter(log.date)
  })
}

function parseLogs (logs, robot = {}) {
  return logs.map(log => {
    const date = moment(log.date)
    const room = (robot.adapterName === 'slack') ? `#${robot.adapter.client.rtm.dataStore.getChannelGroupOrDMById(log.room).name}` : log.room

    return `${log.user.name} (${room}): ${log.text} - ${date.format('YYYY/MM/DD hh:mm')}`
  }).join('\n')
}
