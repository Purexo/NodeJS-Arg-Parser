function throwNotOptional(param) {
    throw new Error(`param: ${param} is not optional`)
}

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

    constructor(priorname=process.argv[1], {name=process.argv[1], description, example}={}) {
        this.name = priorname || name;
        this.description = description;
        this.example = example;

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

    get usage() {
        let usage = `Script : ${this.name}` + '\n';
        usage += `Description :` + '\n';
        usage += `  ${this.description || 'No Description Provided'}` + '\n';

        usage += '\nOptions :';
        usage = [...this.options.values()].reduce((prev, option) => prev + '\n  ' + CommandsDefinition.generateOptionDescription(option), usage);

        usage += '\n\nArguments :';
        usage = [...this.arguments.values()].reduce((prev, argument) => prev + '\n  ' + CommandsDefinition.generateArgumentDescription(argument), usage);

        usage += '\n\nExamples :\n';
        usage += `  ${this.example || 'No Example Provided'}`;
        
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
        const isShort = arg.startsWith('-');
        const isArgument = !(isOption || isShort);

        return {isOption, isShort, isArgument};
    }

    _getArgName(arg, isOption) {
        return arg.slice(isOption ? 2 : 1)
    }

    _checkAllRequired(result) {
        let errname;
        const each = ({optional}, key) => {
            if (!optional && !result.has(key))
                throw new Error(`${errname}: '${key}' is required`);
        };

        errname = 'option';
        this.options.forEach(each);

        errname = 'argument';
        this.arguments.forEach(each);
    }

    process(args = process.argv.slice(2)) {
        const result = this._applyDefault();
        const argumentsKeys = [...this.arguments.keys()];
        const rest = [];

        while (args.length) {
            const arg = args.shift();

            const {isOption, isShort, isArgument} = this._stateArg(arg);

            const options = isOption ? this.options : this.shorts;

            if (!isArgument) {
                const argname = this._getArgName(arg, isOption);

                if (!this.options.has(argname))
                    throw new Error(`option: '${arg}, ${argname}' is not supported`);
                
                const option = options.get(argname);

                if (option.flag) {
                    result.set(argname, true);
                } else {
                    const next = args.shift();

                    if (!next)
                        throw new Error(`option: '${arg}, ${argname}' is not a flag and need a value`);

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

        return {params: result, rest};
    }
}

module.exports = CommandsDefinition;