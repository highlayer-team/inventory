<template>
    <div class="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
        <div class="mx-auto max-w-md space-y-6">
            <div class="flex flex-col items-center space-y-2">
                <img src="@/assets/inventory-01.svg" class="h-32 w-32 text-primary" />
                <h1 class="text-3xl font-bold tracking-tight text-foreground">Inventory</h1>
                <label class="text-sm text-foreground text-primary">Your assistant in bitcoin ecosystem</label>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Login</CardTitle>
                    <CardDescription>Enter mnemonic phrase or generate new wallet</CardDescription>
                </CardHeader>
                <CardContent class="space-y-4">
                    <div class="space-y-2">
                        <Label htmlFor="words">Recovery Words</Label>
                        <div class="grid grid-cols-2 gap-2">
                            <Input 
                v-for="i in wordCount" 
                :key="i"
                :id="'word' + i" 
                :placeholder="'Word ' + i" 
                :value="words[i-1]"
                maxlength="12"
                @input="wordEntered($event, i-1)"
                @keydown="handleKeydown($event, i-1)"
                @paste="handlePaste($event, i-1)"
            />
                        </div>
                    </div>
                    <div class="flex justify-between">
                        <Button variant="outline" class="w-auto" @click="generateNewWallet">
                            Generate new
                        </Button>
                        <Button variant="outline" class="w-auto" @click="toggleWordCount">
                            Switch to {{ wordCount === 12 ? '24' : '12' }} words
                        </Button>
                    </div>
                </CardContent>
                <CardFooter class="flex flex-col gap-4">
                    <Button @click="login" class="w-full text-lg">Login</Button>
                </CardFooter>
            </Card>
        </div>
    </div>
</template>

<script setup>
import { useKeysStore } from '../stores/useKeysStore';

const bip39 = require("bip39")
const keyManager=useKeysStore()
const words = ref(Array(12).fill(''));
const wordCount = ref(12);

function wordEntered(event, index) {
    const inputText = event.target.value.replace(/\s+/g, ''); // Remove all spaces
    words.value[index] = inputText;
    
    if (inputText.length === 12) {
        moveToNextInput(index);
    }
}

function handleKeydown(event, index) {
    if (event.key === ' ') {
        event.preventDefault();
        moveToNextInput(index);
    } else if (event.key === 'Backspace' && !event.target.value) {
        event.preventDefault();
        if (index > 0) {
            const previousInput = document.getElementById(`word${index}`);
            if (previousInput) {
                previousInput.focus();
            }
        }
    }
}

function moveToNextInput(currentIndex) {
    const nextIndex = currentIndex + 1;
    if (nextIndex < words.value.length) {
        const nextInput = document.getElementById(`word${nextIndex + 1}`);
        if (nextInput) {
            nextInput.focus();
        }
    }
}

function handlePaste(event, startIndex) {
    event.preventDefault();
    const pastedText = event.clipboardData.getData('text');
    const pastedWords = pastedText.split(/\s+/).filter(word => word.length > 0);

    pastedWords.forEach((word, index) => {
        const currentIndex = startIndex + index;
        if (currentIndex < words.value.length) {
            words.value[currentIndex] = word.slice(0, 12); // Limit to 12 characters
            const input = document.getElementById(`word${currentIndex + 1}`);
            if (input) {
                input.value = words.value[currentIndex];
            }
        }
    });

    // Focus on the next empty input or the last input
    const nextEmptyIndex = words.value.findIndex((word, index) => index > startIndex && word === '');
    const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : words.value.length - 1;
    const nextInput = document.getElementById(`word${focusIndex + 1}`);
    if (nextInput) {
        nextInput.focus();
    }
}

function generateNewWallet() {
    const mnemonic = bip39.generateMnemonic(wordCount.value === 12 ? 128 : 256);
    words.value = mnemonic.split(" ");
}

function toggleWordCount() {
    wordCount.value = wordCount.value === 12 ? 24 : 12;
    words.value = Array(wordCount.value).fill('');
}
function login(){
    const wordsCombined=words.value.join(" ")
    const entropy=bip39.mnemonicToEntropy(wordsCombined)
    
    keyManager.setEntropy(entropy)
    console.log(keyManager.getAddress("p2wpkh",0,0))
}
</script>
