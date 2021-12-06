import { BufReader,ReadLineResult } from "https://deno.land/std@0.117.0/io/mod.ts";
import yargs from 'https://deno.land/x/yargs/deno.ts';
import { Arguments } from 'https://deno.land/x/yargs/deno-types.ts';

const argv: Arguments  = yargs(Deno.args)
  .usage('dgrep [OPTION]... PATTERNS [FILE]..')
  .command('dgrep', 'deno grep')
  .alias('i', 'ignore-case')
  .describe('i', 'ignore case distinctions in patterns and data')
  .alias('n', 'line-number')
  .describe('n', 'print line number with output lines')
  .alias('h', 'help')
  .boolean(['i', 'n'])
  .default('i', false)
  //.demandOption(['i'])//required
  //.strictCommands()
  .parse();

  //console.log(argv);
  //console.log(argv._[0]);
  //console.log(argv._.length);

if(argv._.length != 2){
    Deno.exit()
}
const word: string = ((word)=> typeof word == "string" ? word: word.toString())(argv._[0]);
const filepath: string = ((filepath)=> typeof filepath == "string" ? filepath: filepath.toString())(argv._[1]);
const encoder = new TextEncoder();
const decoder = new TextDecoder();
const lfUint8 = encoder.encode("\n");
const stdout = Deno.stdout;
const file = await Deno.open(filepath, {read: true});
const bufReader = BufReader.create(file);
let result: ReadLineResult|null;
const regex: RegExp = ((i, word)=> i ? new RegExp(word, "i"): new RegExp(word, ""))(argv.i, word);
const nFlag: boolean = argv.n;
let lineNumber = 0;

if(Deno.build.os == 'windows'){
    console.log("windowsのエンコードはどないしたらええんや");
}
while ( (result = await bufReader.readLine()) != null ) {
    lineNumber++;
    if(-1 != decoder.decode(result.line).search(regex)){
        if(nFlag){
            await stdout.write(encoder.encode(lineNumber.toString()+": "));
        }
        await stdout.write(result.line);
        if(!result.more) {//無制限bufferなので絶対falseになるとは思うが
            await stdout.write(lfUint8);
        }    
    }
}
file.close();
