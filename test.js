const CommandsDefinition = require('.');

const cd = new CommandsDefinition(null, {
    description: 'Test for scripts argument parsing',
    example: `  $ node test --option "I'm the option Option !!" "I'm the first Argument" # {option: "I'm the Option option !!", first: "I'm the first argument"}
    $ node test -o "I'm the option Option !!" "I'm the first Argument" # {option: "I'm the Option option !!", first: "I'm the first argument"}
    $ node test # {option: "default", first: 1}`
})
    .addOption('option', {short: 'o', value: 'default'})
    .addArgument('first', {optional: true, value: 1})
;
const inputs = cd.process();

if (inputs.params.get('help')) {
    console.log(cd.usage);
}

console.log(inputs);