function expect(result) {
    return {
        toEqual(expected) {
            if(result !== expected) {
                throw new Error(`${result} is not equal to ${expected}`);
            }
        },
        toHaveLength(length) {
            // ...
        },
        toBeDefined() {
            // ...
        },
    };
}

async function test(name, callback) {
    try {
        await callback();
        console.log(name);
        console.log('✅ pass');
    } catch(err) {
        console.log(name);
        console.error(`❌ ${err}`);
        console.error(err);
    }
}

global.expect = expect;

global.test = test;
