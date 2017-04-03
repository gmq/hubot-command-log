import 'coffee-script/register'

import test from 'ava'
import Helper from 'hubot-test-helper'
import moment from 'moment'

const helper = new Helper('../src/script.js')

const stub = [
  {
    user: {
      name: 'Fred'
    },
    text: 'hubot help',
    date: moment('2016-01-01 10:00', 'YYYY-MM-DD hh:mm').toDate(),
    room: '#random'
  },
  {
    user: {
      name: 'Fred'
    },
    text: 'hubot spam everyone',
    date: moment('2016-01-01 12:00', 'YYYY-MM-DD hh:mm').toDate(),
    room: '#random'
  },
  {
    user: {
      name: 'Peter'
    },
    text: 'hubot help I\'m trapped in the past',
    date: moment('2013-01-01 12:00', 'YYYY-MM-DD hh:mm').toDate(),
    room: '#random'
  }
]

test.beforeEach(t => {
  t.context.room = helper.createRoom({ httpd: false })
  t.context.room.robot.brain.data._private['hubot-command-log'] = stub
})

test.afterEach.always('destroy room', t => {
  t.context.room.destroy()
})

test.cb('it should find two commands in the range provided', t => {
  t.context.room.user.say('user', 'hubot command-log 2016/01/01 10:00 - 2016/01/01 13:00')

  setTimeout(() => {
    t.deepEqual(t.context.room.messages, [
      ['user', 'hubot command-log 2016/01/01 10:00 - 2016/01/01 13:00'],
      ['hubot', 'Fred: hubot help - 2016/01/01 10:00\nFred: hubot spam everyone - 2016/01/01 12:00']
    ])

    t.end()
  }, 1000)
})

test.cb('it should output correct error message if nothing is found', t => {
  t.context.room.user.say('user', 'hubot command-log 2010/01/01 10:00')

  setTimeout(() => {
    t.deepEqual(t.context.room.messages, [
      ['user', 'hubot command-log 2010/01/01 10:00'],
      ['hubot', 'No logs found for specified range 2010/01/01 10:00 - 2010/01/01 11:59']
    ])

    t.end()
  }, 1000)
})

test.cb('it should recognize badly formatted dates', t => {
  t.context.room.user.say('user', 'hubot command-log someday')

  setTimeout(() => {
    t.deepEqual(t.context.room.messages, [
      ['user', 'hubot command-log someday'],
      ['hubot', `I can't understand that date, try using the following formats: YYYY/MM/DD hh:mm, YYYY/MM/DD, hh:mm.
        Example: 2016/12/30 12:00 - 2016/12/30 17:00`]
    ])

    t.end()
  }, 1000)
})

test.cb('it should be able to parse dates without an hour', t => {
  t.context.room.user.say('user', 'hubot command-log 2016/01/01')

  setTimeout(() => {
    t.deepEqual(t.context.room.messages, [
      ['user', 'hubot command-log 2016/01/01'],
      ['hubot', 'Fred: hubot help - 2016/01/01 10:00\nFred: hubot spam everyone - 2016/01/01 12:00']
    ])

    t.end()
  }, 1000)
})
