# hubot-cne

[![Build Status](https://img.shields.io/travis/gmq/hubot-command-log.svg?style=flat-square)](https://travis-ci.org/gmq/hubot-command-log)

Save and retrieve all commands sent to hubot.

## Installation

```bash
yarn add hubot-command-log
```

Add "hubot-command-log" to `external-scripts.json`.

## Examples

```bash
hubot command-log 2016/12/31
hubot command-log 2016/12/01 - 2016/12/31
hubot command-log 2016/12/31 10:00 - 2016/12/31 12:00
hubot command-log 10:00 - 13:00 # Uses the current date if none is given
hubot command-log 10:00
```

## License

[MIT](https://tldrlegal.com/license/mit-license)