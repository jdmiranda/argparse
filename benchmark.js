#!/usr/bin/env node

/**
 * Performance benchmark for argparse optimizations
 * Compares performance before and after optimizations
 */

const { ArgumentParser } = require('./argparse.js');

// Benchmark utilities
function benchmark(name, fn, iterations = 10000) {
    const start = process.hrtime.bigint();
    for (let i = 0; i < iterations; i++) {
        fn();
    }
    const end = process.hrtime.bigint();
    const duration = Number(end - start) / 1000000; // Convert to milliseconds
    return {
        name,
        iterations,
        totalTime: duration,
        avgTime: duration / iterations
    };
}

// Test scenarios
function runBenchmarks() {
    console.log('Running argparse performance benchmarks...\n');
    console.log('=' .repeat(60));

    const results = [];

    // Benchmark 1: Simple parser creation and parsing
    console.log('Test 1: Simple parser with basic options');
    results.push(benchmark('Simple parser creation', () => {
        const parser = new ArgumentParser({
            description: 'Simple test parser'
        });
        parser.add_argument('--foo', { help: 'foo option' });
        parser.add_argument('--bar', { help: 'bar option' });
        parser.add_argument('positional');
    }, 5000));

    // Create parser once for parsing tests
    const simpleParser = new ArgumentParser({ add_help: false });
    simpleParser.add_argument('--foo');
    simpleParser.add_argument('--bar');
    simpleParser.add_argument('positional');

    results.push(benchmark('Simple argument parsing', () => {
        simpleParser.parse_args(['--foo', 'test', '--bar', 'value', 'pos']);
    }, 10000));

    // Benchmark 2: Complex parser with many options
    console.log('\nTest 2: Complex parser with mutually exclusive groups');
    const complexParser = new ArgumentParser({ add_help: false });
    const group1 = complexParser.add_mutually_exclusive_group();
    group1.add_argument('--opt1');
    group1.add_argument('--opt2');
    const group2 = complexParser.add_mutually_exclusive_group();
    group2.add_argument('--opt3');
    group2.add_argument('--opt4');

    for (let i = 0; i < 10; i++) {
        complexParser.add_argument(`--option${i}`, { help: `Option ${i}` });
    }

    results.push(benchmark('Complex parsing with conflicts', () => {
        complexParser.parse_args(['--opt1', 'val', '--option5', 'test']);
    }, 5000));

    // Benchmark 3: Negative number handling
    console.log('\nTest 3: Negative number parsing');
    const negParser = new ArgumentParser({ add_help: false });
    negParser.add_argument('--value', { type: 'float' });
    negParser.add_argument('numbers', { nargs: '*' });

    results.push(benchmark('Negative number detection', () => {
        negParser.parse_args(['--value', '-3.14', '-1', '-2', '-3']);
    }, 10000));

    // Benchmark 4: String operations and help formatting
    console.log('\nTest 4: Help text formatting');
    const helpParser = new ArgumentParser({
        prog: 'benchmark',
        description: 'A complex parser with lots of help text'
    });

    for (let i = 0; i < 20; i++) {
        helpParser.add_argument(`--long-option-name-${i}`, {
            help: `This is a long help text for option ${i} that needs formatting`,
            metavar: 'VALUE',
            default: 'default'
        });
    }

    results.push(benchmark('Help text generation', () => {
        helpParser.format_help();
    }, 1000));

    // Print results
    console.log('\n' + '=' .repeat(60));
    console.log('BENCHMARK RESULTS:');
    console.log('=' .repeat(60));

    results.forEach(result => {
        console.log(`\n${result.name}:`);
        console.log(`  Iterations: ${result.iterations}`);
        console.log(`  Total time: ${result.totalTime.toFixed(2)} ms`);
        console.log(`  Average time per operation: ${(result.avgTime * 1000).toFixed(3)} µs`);
    });

    // Calculate and display aggregate metrics
    const totalTime = results.reduce((sum, r) => sum + r.totalTime, 0);
    console.log('\n' + '=' .repeat(60));
    console.log(`Total benchmark time: ${totalTime.toFixed(2)} ms`);

    // Performance notes
    console.log('\n' + '=' .repeat(60));
    console.log('OPTIMIZATION NOTES:');
    console.log('- Regex patterns are now cached at module level');
    console.log('- Array operations use spread operator instead of concat');
    console.log('- Stack trace parsing is lazy (only when needed)');
    console.log('- String operations optimized with cached patterns');
    console.log('=' .repeat(60));
}

// Run benchmarks
if (require.main === module) {
    runBenchmarks();
}

module.exports = { benchmark, runBenchmarks };