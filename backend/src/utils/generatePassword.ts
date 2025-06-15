import bcrypt from 'bcrypt'

async function generatePassword() {
    const password = 'Windkracht#12NL'
    const saltRounds = 12
    const hash = await bcrypt.hash(password, saltRounds)
    console.log('Test password:', password)
    console.log('Generated hash:', hash)

    // Test de hash
    const isValid = await bcrypt.compare(password, hash)
    console.log('Hash verification:', isValid)
}

generatePassword()