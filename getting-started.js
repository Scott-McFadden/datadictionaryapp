const mongoose = require('mongoose');

main().catch(err => console.log(err));

async function main() {
    console.log("opening");
    await mongoose.connect('mongodb://localhost/test');



const kittySchema = new mongoose.Schema({
    name: String
});
kittySchema.methods.speak = function speak() {
    const greeting = this.name
        ? "Meow name is " + this.name
        : "I don't have a name";
    console.log(greeting);
};

const Kitten = mongoose.model('Kitten', kittySchema);
const fluffy = new Kitten({ name: 'fluffy' });

await fluffy.save();
fluffy.speak();

    const kittens = await Kitten.find();
    console.log(kittens);

   process.exit(1);
}