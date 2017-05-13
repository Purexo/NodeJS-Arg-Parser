function throwNotOptional(param) {
    throw new Error(`param: ${param} is not optional`)
}

class ParseError extends Error {}
class RequiredError extends ParseError {}
class RequiredOptionError extends RequiredError {}
class RequiredArgumentError extends RequiredError {}
class OptionError extends ParseError {}
class UnsupportedOptionError extends OptionError {}
class NeedValueOptionError extends OptionError {}

class CommandsDefinition {
    static slugify(name) {
        return name.replace(/([^a-zA-Z0-9]+)/g, '-');
    }

    static generateOptionDescription({name, optional, flag, value, short, description}) {
        if (!description) {
            description = `No Description Provided`;
        }
        description = `${name} - is ${!optional ? 'required' : 'optional'}${value ? ' - default : ' + value : ''} - ${description} - use : --${name} ${flag ? '' : 'A_VALUE'}`;
        description += short ? ` or -${short} ${flag ? '' : 'A_VALUE'}` : ''; 

        return description;
    }

    static generateArgumentDescription({name, optional, value, description}) {
        if (!description) {
            description = `No Description Provided`;
        }

        description = `${name} - is ${!optional ? 'required' : 'optional'}${value ? ' - default : ' + value : ''} - ${description} - use : A_VALUE`;

        return description;
    }

    constructor({name=process.argv[1], description, example, examples=[]}={}) {
        this.name = name || throwNotOptional('name');
        this.description = description;
        this.examples = examples;
        if (example) {
            this.examples.unshift(example)
        }

        this.arguments = new Map();

        this.options = new Map();
        this.shorts = new Map();

        this.addOption('help', {flag: true, short: 'h', description: 'print this usage message'});
    }

    addOption(name = throwNotOptional('name'), {optional=true, flag=false, value=null, short=null, description=null}={}) {
        name = CommandsDefinition.slugify(name);
        const option = {name, optional, flag, value, short, description};

        this.options.set(name, option);
        if (short) {
            this.shorts.set(short, option)
        }

        return this;
    }

    addArgument(name = throwNotOptional('name'), {optional=false, value=null, description=null}={}) {
        name = CommandsDefinition.slugify(name);

        this.arguments.set(name, {name, optional, value, description});

        return this;
    }

    _getRequiredArgumentsText() {
        return [...this.arguments.values()]
            .filter(({optional}) => !optional)
            .map(({name}) => `<${name}>`)
            .concat(
                [...this.arguments.values()]
                    .filter(({optional}) => optional)
                    .map(({name}) => `[<${name}>]`)
            )
            .join(' ');
    }

    _getOptionsText() {
        return [...this.options.values()]
            .sort(({optional: oa}, {optional: ob}) => ((oa ? 1 : 0) - (ob ? 1 : 0)))
            .map(({name, optional, flag, short}) => {
                if (flag) {
                    return `[${short ? `-${short}, `: ''}--${name}]`;
                }

                if (optional) {
                    return `[${short ? `-${short}, `: ''}--${name} VALUE]`;
                }
                
                return `--${name} VALUE`;
            })
            .join(' ');
    }

    _getExamplesText() {
        if (this.examples.length === 0) {
            return '\n  No Example Provided';
        }

        return this.examples.join('\n  ');
    }

    get usage() {
        let usage = `Script : ${this.name}` + '\n';
        usage += `Description :` + '\n';
        usage += `  ${this.description || 'No Description Provided'}` + '\n';

        usage += `\nUsage :` + '\n';
        const optiontext = this._getOptionsText();
        const argumenttext = this._getRequiredArgumentsText();
        usage += `  $ ${this.name}${optiontext !== '' ? ` ${optiontext}` : ''}${argumenttext !== '' ? ` ${argumenttext}` : ''}`;

        usage += '\n\nOptions :';
        usage = [...this.options.values()].reduce((prev, option) => prev + '\n  ' + CommandsDefinition.generateOptionDescription(option), usage);

        usage += '\n\nArguments :';
        usage = [...this.arguments.values()].reduce((prev, argument) => prev + '\n  ' + CommandsDefinition.generateArgumentDescription(argument), usage);

        usage += '\n\nExamples :\n';
        usage += `  ${this._getExamplesText()}`;

        return usage;
    }

    _applyDefault() {
        const map = new Map();
        const each = ({flag=false, value, optional}, name) => {
            if (optional) {
                map.set(name, flag ? false : value);
            }
        };

        this.options.forEach(each);
        this.arguments.forEach(each);

        return map;
    }

    _stateArg(arg) {
        const isOption = arg.startsWith('--');
        const isShort = !isOption && arg.startsWith('-');
        const isArgument = !(isOption || isShort);

        return {isOption, isShort, isArgument};
    }

    _getOptionName(arg, isOption) {
        return arg.slice(isOption ? 2 : 1)
    }

    _checkAllRequired(result) {
        if (result.get('help')) return;
        
        this.options.forEach(({optional}, key) => {
            if (!optional && !result.has(key))
                throw new RequiredOptionError(`option: '--${key}' is required`);
        });
        
        this.arguments.forEach(({optional}, key) => {
            if (!optional && !result.has(key))
                throw new RequiredArgumentError(`argument: '<${key}>' is required`);
        });
    }

    _process(args) {
        const result = this._applyDefault();
        const argumentsKeys = [...this.arguments.keys()];
        const rest = [];

        while (args.length) {
            const arg = args.shift();

            const {isOption, isShort, isArgument} = this._stateArg(arg);

            const options = isOption ? this.options : this.shorts;

            if (!isArgument) {
                const argname = this._getOptionName(arg, isOption);

                if (!options.has(argname))
                    throw new UnsupportedOptionError(`option: '${arg}' is not supported`);
                
                const option = options.get(argname);

                if (option.flag) {
                    result.set(option.name, true);
                } else {
                    const next = args.shift();

                    if (!next)
                        throw new NeedValueOptionError(`option: '${arg}, ${option.name}' is not a flag and need a value`);

                    result.set(argname, next);
                }
            } else {
                const key = argumentsKeys.shift();

                if (key) {
                    result.set(key, arg);
                } else {
                    rest.push(arg);
                }
            }
        }

        this._checkAllRequired(result);

        result.rest = rest;
        return result;
    }

    process(args = process.argv.slice(2)) {
        try {
            return this._process(args)
        } catch (e) {
            throw new e.constructor(`${e.message}${'\n\n'}${this.usage}`);
        }
    }
}

module.exports = CommandsDefinition;