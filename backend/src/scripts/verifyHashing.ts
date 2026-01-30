import bcrypt from 'bcrypt';

const main = async () => {
    // Simulate generation
    const password = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
    console.log('Generated:', password);

    // Hash
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Hashed:', hashedPassword);

    // Compare Correct
    const match = await bcrypt.compare(password, hashedPassword);
    console.log('Match (should be true):', match);

    // Compare Wrong
    const noMatch = await bcrypt.compare(password + ' ', hashedPassword);
    console.log('Match with space (should be false):', noMatch);

    // Compare with trimmed (if unrelated)
    const matchTrimmed = await bcrypt.compare(password.trim(), hashedPassword);
    console.log('Match trimmed (should be true):', matchTrimmed);
};

main();
