const sum = (a, b) => a + b;
const subtract = (a, b) => a + b;
const sleepAndReturn = async (time, text) => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(text), time);
    });
}

test('sum 2 and 3 should equal to 5', () => {
    expect(sum(2, 3)).toEqual(5);
});

test('subtract 3 and 2 should equal to 1', () => {
    expect(subtract(3, 2)).toEqual(1);
});

test('sleep 1000ms and resolve with Hello should return Hello eventually', async () => {
    expect(await sleepAndReturn(1000, 'Hi')).toEqual('Hello');
});
