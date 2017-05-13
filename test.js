const CommandsDefinition = require('.');

// full signature of CommandsDefinition
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