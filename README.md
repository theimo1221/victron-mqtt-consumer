# victron-mqtt-consumer

[![TypeScript version][ts-badge]][typescript-4-9]
[![Node.js version][nodejs-badge]][nodejs]
[![APLv2][license-badge]][license]

## Description
This is a simple Node.js application that 
1. consumes MQTT messages from Victron devices
2. Holds collected data in memory (with typed accessors)
3. Offers some basic controlling capabilities (e.g. to set gridPoint)
4. (if configured) publishes them to InfluxDB.

## Storing in InfluxDB
The application can be configured to store the data in InfluxDB.
This is done by passing the correct options, during creation of the consumer.
The database will be created if it does not exist.

The data structure is parallel to the Implementation of https://github.com/victronenergy/venus-docker-grafana-images to allow usage of the same Grafana dashboards. Thanks guys!


## License

Licensed under the APLv2. See the [LICENSE](https://github.com/theimo1221/victron-mqtt-consumer/blob/main/LICENSE) file for details.

[ts-badge]: https://img.shields.io/badge/TypeScript-4.9-blue.svg
[nodejs-badge]: https://img.shields.io/badge/Node.js->=%2018.12-blue.svg
[nodejs]: https://nodejs.org/dist/latest-v18.x/docs/api/
[typescript]: https://www.typescriptlang.org/
[typescript-4-9]: https://devblogs.microsoft.com/typescript/announcing-typescript-4-9/
[license-badge]: https://img.shields.io/badge/license-APLv2-blue.svg
[license]: https://github.com/theimo1221/victron-mqtt-consumer/blob/main/LICENSE
[jest]: https://facebook.github.io/jest/
[eslint]: https://github.com/eslint/eslint
[prettier]: https://prettier.io
[volta]: https://volta.sh
[volta-getting-started]: https://docs.volta.sh/guide/getting-started
[volta-tomdale]: https://twitter.com/tomdale/status/1162017336699838467?s=20
[gh-actions]: https://github.com/features/actions
[esm]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules
[sindresorhus-esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c
[nodejs-esm]: https://nodejs.org/docs/latest-v16.x/api/esm.html
[ts47-esm]: https://devblogs.microsoft.com/typescript/announcing-typescript-4-9/#esm-nodejs
[editorconfig]: https://editorconfig.org
