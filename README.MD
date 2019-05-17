# Simple Arg Parser - for NodeJS

Parsing commands line arguments have always been an annoying task. With this litle lib you can easyli describe what your script.

# Installation
```
npm install Purexo/NodeJS-Arg-Parser
```

# Example
## script.js
```js
const CommandsDefinition = require('simple-arg-parser');
const cd = new CommandsDefinition({
    name: 'script.js', // optional, take process.argv[1] by default
    description: 'my awesome script with many arguments and options with simple parsing', // optional, No Description Provided
    example: '1st Example for using my script', // optional, shortcut for examples: []
    examples: [
        '2nd Example for using my script',
        '3rd Example for using my script',
    ] // optional, if example provided, populate in examples
    // if examples nor example provided, output No Example Provided
    // all these params are optional, you can new CommandsDefinition()
})
    // a classical option : --option-1 VALUE
    .addOption('option-1') // is optional, --option-1 VALUE, No Description Provided

    // the complete default signature. if param is not provided, it take this value
    .addOption('option-2', {
        optional: true,
        flag: false,
        value: null,
        short: null,
        description: null
    }) // --option-2 VALUE, No Description Provided

    // a flag option
    .addOption('force', {
        flag: true,
        short: 'f',
        description: 'force action'
    }) // -f or --force, force action

    // a required option with shortcut
    .addOption('required', {
        optional: false,
        short: 'r',
        description: 'this option is required'
    }) // --required VALUE or -r VALUE

    // Arguments
    // simple, by default argument is required
    .addArgument('first')

    // detailled default signature
    .addArgument('second', {
        optional:false,
        value:null,
        description:null
    })

    // optional argument like need a path but provided one by default
    .addArgument('log-path', {
        optional: true,
        value: process.cwd(),
        description: 'the directory of log'
    })
;

// process return a map of params so the keys will be
// ['option-1', 'option-2', 'force', 'required', 'first', 'second', 'log-path']
// process throw Error if a required argument or option is not set,
// an option is not recognized (--invalid-option is not in cd),
// or use an option like a flag but no value given

try {
    // cd.process can take an argument : array of string, if not provided process.argv.slice(2) will be used
    const inputs = cd.process();

    if (inputs.get('help')) {
        // cd.usage is a getter, it generate a usage text with info provided
        console.log(cd.usage);
        process.exit(0);
    }

    console.log(inputs);

    // if we have more arguments gived in command line than defined in cd
    // they were put in inputs.rest (not inputs.get('rest'). it's an array)
} catch(e) {
    // in this e error, we have the usage of cd
    console.log(e.message)
}
```

### Output with `node script.js` :
```
option: '--required' is required

Script : script.js
Description :
  my awesome script with many arguments and options with simple parsing

Usage :
  $ script.js --required VALUE [-h, --help] [--option-1 VALUE] [--option-2 VALUE] [-f, --force] <first> <second> [<log-path>]

Options :
  help - is optional - print this usage message - use : --help  or -h 
  option-1 - is optional - No Description Provided - use : --option-1 A_VALUE
  option-2 - is optional - No Description Provided - use : --option-2 A_VALUE
  force - is optional - force action - use : --force  or -f 
  required - is required - this option is required - use : --required A_VALUE or -r A_VALUE

Arguments :
  first - is required - No Description Provided - use : A_VALUE
  second - is required - No Description Provided - use : A_VALUE
  log-path - is optional - default : E:\Users\Purexo\Projets\arguments - the directory of log - use : A_VALUE

Examples :
  1st Example for using my script
  2nd Example for using my script
  3rd Example for using my script
```

### Output with `node script.js --required "REQUIRED VALUE" arg1 "Argument 2" . rest1 rest2` :
```
Map {
  'help' => false,
  'option-1' => null,
  'option-2' => null,
  'force' => false,
  'log-path' => '.',
  'required' => 'REQUIRED VALUE',
  'first' => 'arg1',
  'second' => 'Argument 2',
  rest: [ 'rest1', 'rest2' ] }
```

### Output with `node script.js -h` :
```
Script : script.js
Description :
  my awesome script with many arguments and options with simple parsing

Usage :
  $ script.js --required VALUE [-h, --help] [--option-1 VALUE] [--option-2 VALUE] [-f, --force] <first> <second> [<log-path>]

Options :
  help - is optional - print this usage message - use : --help  or -h 
  option-1 - is optional - No Description Provided - use : --option-1 A_VALUE
  option-2 - is optional - No Description Provided - use : --option-2 A_VALUE
  force - is optional - force action - use : --force  or -f 
  required - is required - this option is required - use : --required A_VALUE or -r A_VALUE

Arguments :
  first - is required - No Description Provided - use : A_VALUE
  second - is required - No Description Provided - use : A_VALUE
  log-path - is optional - default : E:\Users\Purexo\Projets\arguments - the directory of log - use : A_VALUE

Examples :
  1st Example for using my script
  2nd Example for using my script
  3rd Example for using my script
```

# Details 
In the command line argument world we distinct 3 type of argument :

- Positional Arguments, in this lib, we call them Argument.
    - example : `$ your_script "First Argument" "Second Argument"`
- Options :
    - They can be long :
        - example : `$ your_script --append path/file`
    - They can be short :
        - example : `$ your_script -a path/file`
- Flags : they are like Options but without value.
    - example :
        - `$ your_script --help`
        - `$ your_script -h`

# API

```ts
class CommandsDefinition {
    constructor({name?: string, description?: string, example?: string, examples?: string[]})

    addOption(name:string, {optional?: boolean, flag?: boolean, value?: any, short?: boolean|string, description?: string}) : CommandsDefinition {}
    addArgument(name:string, {optional?: boolean, value?: any, description?: string}) : CommandsDefinition {}

    get usage() : string {}

    process(args?: string[]) : Map + rest: string[] {}
}
```

# License :
[ISC](https://en.wikipedia.org/wiki/ISC_license)
