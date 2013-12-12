load ('base.js');

// load individual benchmarks
load ('ao_simd_soa_nossemath-O1.js');
load ('aobench_emcc.js');

function printResult (str) {
  print (str);
}

function printError (str) {
  print (str);
}

function printScore (str) {
  print (str);
}

benchmarks.runAll ({notifyResult: printResult,
                    notifyError:  printError,
                    notifyScore:  printScore},
                   true);
