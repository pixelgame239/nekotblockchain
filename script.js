function formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import { getFirestore, collection, doc, setDoc, onSnapshot, serverTimestamp, addDoc, updateDoc, getDoc, getDocs, query, where, orderBy, limit } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";

// --- 1. CONFIGURATION ---
const firebaseConfig = {
    apiKey: "API_KEY",
    authDomain: "DOMAIN",
    projectId: "PROJECTID",
    storageBucket: "BUCKET",
    appId: "APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

let provider, signer, userWalletAddress;

// --- ON-CHAIN CONTRACT CONFIG ---
// Paste your deployed addresses and ABIs here (or fetch from hosted JSON)
let TOKEN_ADDRESS = "0x95BCe92F900870edd37Fd885B7b74c7a7Bb15668";
let MARKETPLACE_ADDRESS = "0x50C0b745De03E7d9566cC7961A4F8dFeC733a95E";
let TOKEN_ABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"AccessControlBadConfirmation","type":"error"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"bytes32","name":"neededRole","type":"bytes32"}],"name":"AccessControlUnauthorizedAccount","type":"error"},{"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"address","name":"owner","type":"address"}],"name":"ERC721IncorrectOwner","type":"error"},{"inputs":[{"internalType":"address","name":"operator","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"ERC721InsufficientApproval","type":"error"},{"inputs":[{"internalType":"address","name":"approver","type":"address"}],"name":"ERC721InvalidApprover","type":"error"},{"inputs":[{"internalType":"address","name":"operator","type":"address"}],"name":"ERC721InvalidOperator","type":"error"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"ERC721InvalidOwner","type":"error"},{"inputs":[{"internalType":"address","name":"receiver","type":"address"}],"name":"ERC721InvalidReceiver","type":"error"},{"inputs":[{"internalType":"address","name":"sender","type":"address"}],"name":"ERC721InvalidSender","type":"error"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"ERC721NonexistentToken","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"approved","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":false,"internalType":"bool","name":"approved","type":"bool"}],"name":"ApprovalForAll","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"role","type":"bytes32"},{"indexed":true,"internalType":"bytes32","name":"previousAdminRole","type":"bytes32"},{"indexed":true,"internalType":"bytes32","name":"newAdminRole","type":"bytes32"}],"name":"RoleAdminChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"role","type":"bytes32"},{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":true,"internalType":"address","name":"sender","type":"address"}],"name":"RoleGranted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"role","type":"bytes32"},{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":true,"internalType":"address","name":"sender","type":"address"}],"name":"RoleRevoked","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[],"name":"DEFAULT_ADMIN_ROLE","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"MARKETPLACE_ROLE","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"approve","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"marketplaceAddr","type":"address"}],"name":"authorizeMarketplace","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"createAsset","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"getApproved","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"getLastSaleTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"}],"name":"getRoleAdmin","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"grantRole","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"hasRole","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"operator","type":"address"}],"name":"isApprovedForAll","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"ownerOf","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"callerConfirmation","type":"address"}],"name":"renounceRole","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"revokeRole","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"operator","type":"address"},{"internalType":"bool","name":"approved","type":"bool"}],"name":"setApprovalForAll","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"tokenURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"transferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"updateSaleTime","outputs":[],"stateMutability":"nonpayable","type":"function"}]; 
let MARKETPLACE_ABI = [{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"itemId","type":"uint256"},{"indexed":true,"internalType":"address","name":"buyer","type":"address"},{"indexed":true,"internalType":"address","name":"seller","type":"address"},{"indexed":false,"internalType":"uint256","name":"price","type":"uint256"}],"name":"ItemSold","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"itemId","type":"uint256"},{"indexed":true,"internalType":"address","name":"seller","type":"address"}],"name":"MarketItemCancelled","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"itemId","type":"uint256"},{"indexed":true,"internalType":"address","name":"seller","type":"address"},{"indexed":false,"internalType":"address","name":"nftContract","type":"address"},{"indexed":false,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"price","type":"uint256"}],"name":"MarketItemCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"itemId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"oldPrice","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newPrice","type":"uint256"}],"name":"MarketItemPriceUpdated","type":"event"},{"inputs":[{"internalType":"uint256","name":"itemId","type":"uint256"}],"name":"buyMarketItem","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"itemId","type":"uint256"}],"name":"cancelMarketItem","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"nftContract","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"uint256","name":"price","type":"uint256"}],"name":"createMarketItem","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"itemId","type":"uint256"}],"name":"getMarketItem","outputs":[{"components":[{"internalType":"uint256","name":"itemId","type":"uint256"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"address payable","name":"seller","type":"address"},{"internalType":"address","name":"nftContract","type":"address"},{"internalType":"uint256","name":"price","type":"uint256"},{"internalType":"bool","name":"sold","type":"bool"},{"internalType":"bool","name":"cancelled","type":"bool"}],"internalType":"struct DigitalAssetMarketplace.MarketItem","name":"","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"itemId","type":"uint256"},{"internalType":"uint256","name":"newPrice","type":"uint256"}],"name":"updateMarketItemPrice","outputs":[],"stateMutability":"nonpayable","type":"function"}];

let tokenContract = null;
let marketplaceContract = null;

async function initContracts() {
    if (!window.ethereum) throw new Error('No injected provider');
    if (!TOKEN_ADDRESS || !MARKETPLACE_ADDRESS) throw new Error('Please set TOKEN_ADDRESS and MARKETPLACE_ADDRESS');
    if (!TOKEN_ABI || !MARKETPLACE_ABI) throw new Error('Please set TOKEN_ABI and MARKETPLACE_ABI');

    provider = provider || new ethers.BrowserProvider(window.ethereum);
    signer = signer || await provider.getSigner();

    tokenContract = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, signer);
    marketplaceContract = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, signer);
}

async function onChainMint(name, priceEth, imageUrl) {
    if (!userWalletAddress) return openModal('walletModal');
    await initContracts();
    showLoading('Sending mint transaction...');
    try {
        const tx = await tokenContract.createAsset();
        const receipt = await tx.wait();

    // parse AssetCreated event (preferred) or fallback to ERC721 Transfer from zero address
    let tokenId = null;
    const zero = '0x0000000000000000000000000000000000000000';
    try {
        for (const l of receipt.logs) {
            try {
                if (!l.address) continue;
                if (l.address.toLowerCase() !== TOKEN_ADDRESS.toLowerCase()) continue;
                const parsed = tokenContract.interface.parseLog(l);
                if (parsed && parsed.name === 'AssetCreated') {
                    tokenId = parsed.args.tokenId?.toString();
                    break;
                }
                if (parsed && parsed.name === 'Transfer') {
                    // Transfer(address from, address to, uint256 tokenId)
                    const from = parsed.args.from || parsed.args[0];
                    if (from && from.toLowerCase() === zero) {
                        tokenId = parsed.args.tokenId?.toString();
                        break;
                    }
                }
            } catch (e) { /* ignore parse errors for unrelated logs */ }
        }
    } catch (e) {
        console.warn('Error while parsing mint receipt logs', e);
    }

    // Fallback: if events not found, try callStatic to predict tokenId (best-effort)
    if (!tokenId) {
        try {
            const predicted = await tokenContract.callStatic.createAsset();
            if (predicted != null) tokenId = predicted.toString();
            console.warn('Predicted tokenId from callStatic as fallback:', tokenId);
        } catch (e) {
            console.warn('callStatic fallback failed', e);
        }
    }

    if (!tokenId) throw new Error('TokenId not found in mint receipt');

    // create Firestore document for this asset
    const itemRef = doc(collection(db, 'artifacts', appId, 'public', 'data', 'marketItems'));
    await setDoc(itemRef, {
        tokenId: tokenId.toString(),
        name,
        price: priceEth,
        itemImage: imageUrl || '',
        owner: userWalletAddress,
        creator: userWalletAddress,
        isListed: false,
        createdAt: serverTimestamp(),
        lastBoughtTimestamp: serverTimestamp()
    });

    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'transactions'), {
        itemId: itemRef.id,
        itemName: name,
        price: priceEth,
        buyer: userWalletAddress,
        seller: '0x0000000000000000000000000000000000000000',
        type: 'MINT',
        timestamp: serverTimestamp()
    });

        showToast('Mint successful — saved to database');
        await refreshBalance();
        return { tokenId, docId: itemRef.id };
    } finally {
        hideLoading();
    }
}


async function listItemOnChain(firestoreDocId, tokenId, priceEth) {
    await initContracts();
    showLoading('Listing item on-chain...');
    try {
    // Check on-chain cooldown (best-effort). If token supports getLastSaleTime, prevent listing within 1 hour.
    try {
        const lastSale = await tokenContract.getLastSaleTime(BigInt(tokenId));
        // lastSale is BigInt (ethers v6). Use BigInt arithmetic to compare to current time.
        const now = BigInt(Math.floor(Date.now() / 1000));
        if (lastSale !== 0n && now < (lastSale + 3600n)) {
            const waitSeconds = Number((lastSale + 3600n) - now);
            showToast(`Cannot list yet — wait ${formatTime(waitSeconds)}`);
            return null;
        }
    } catch (e) {
        // Token may not implement getLastSaleTime; continue to attempt listing.
    }

    showToast('Approving marketplace...');
    const approveTx = await tokenContract.approve(MARKETPLACE_ADDRESS, BigInt(tokenId));
    await approveTx.wait();

    showToast('Creating market item on-chain...');
    const priceWei = ethers.parseEther(priceEth.toString());
    const tx = await marketplaceContract.createMarketItem(TOKEN_ADDRESS, BigInt(tokenId), priceWei);
    const receipt = await tx.wait();

    // parse MarketItemCreated event to get on-chain itemId
    let onChainItemId = null;
    for (const l of receipt.logs) {
        try {
            const parsed = marketplaceContract.interface.parseLog(l);
            if (parsed && parsed.name === 'MarketItemCreated') {
                onChainItemId = parsed.args.itemId?.toString();
                break;
            }
        } catch (e) { }
    }

        // Update Firestore doc with listing info and on-chain id
        const itemRef = doc(db, 'artifacts', appId, 'public', 'data', 'marketItems', firestoreDocId);
        const updatePayload = { isListed: true, price: priceEth };
        if (onChainItemId) updatePayload.marketItemId = onChainItemId;
        await updateDoc(itemRef, updatePayload);

        showToast('Item listed on-chain and updated in Firestore');
        await refreshBalance();
        return onChainItemId;
    } finally {
        hideLoading();
    }
}

async function buyItemOnChain(firestoreDocId, priceEth) {
    await initContracts();
    showLoading('Processing purchase...');
    try {
        // Read Firestore doc to get marketItemId
        const itemSnap = await getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'marketItems', firestoreDocId));
        let marketItemId = null;
        if (itemSnap && itemSnap.exists && itemSnap.data) {
            const data = itemSnap.data();
            marketItemId = data.marketItemId || null;
        }

        if (!marketItemId) throw new Error('marketItemId not found in Firestore doc');

        // read existing owner/name BEFORE updating so transaction records correct seller
        const itemRef = doc(db, 'artifacts', appId, 'public', 'data', 'marketItems', firestoreDocId);
        const beforeSnap = await getDoc(itemRef);
        const prevOwner = beforeSnap && beforeSnap.exists() ? (beforeSnap.data().owner || null) : null;
        const itemName = beforeSnap && beforeSnap.exists() ? (beforeSnap.data().name || ('Item ' + firestoreDocId)) : ('Item ' + firestoreDocId);

        const priceWei = ethers.parseEther(priceEth.toString());
        showToast('Sending purchase transaction...');
        const tx = await marketplaceContract.buyMarketItem(BigInt(marketItemId), { value: priceWei });
        await tx.wait();

        // Update Firestore ownership and transactions
        await updateDoc(itemRef, { owner: userWalletAddress, isListed: false, lastBoughtTimestamp: serverTimestamp() });

        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'transactions'), {
            itemId: firestoreDocId,
            itemName: itemName,
            price: priceEth,
            buyer: userWalletAddress,
            seller: prevOwner,
            type: 'SALE',
            timestamp: serverTimestamp()
        });

        showToast('Purchase complete — Firestore updated');
        await refreshBalance();
        return true;
    } finally {
        hideLoading();
    }
}

const shortenAddress = (addr) => {
    if (!addr || addr === "0x0000000000000000000000000000000000000000") return "System (Mint)";
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
};

// --- 2. AUTHENTICATION ---
const initAuth = async () => {
    try {
        const cred = await signInAnonymously(auth);
        subscribeToMarketplace();
        subscribeToHistory();
    } catch (error) {
        console.error("Firebase Auth Error:", error);
    }
};

onAuthStateChanged(auth, (user) => {
    if (!user) initAuth();
});

// --- 3. BLOCKCHAIN & AUTO-CONNECT LOGIC ---

const checkPersistedConnection = async () => {
    const wasConnected = localStorage.getItem('walletConnected') === 'true';
    if (wasConnected && typeof window.ethereum !== 'undefined') {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                await connectWallet();
            }
        } catch (err) {
            console.error("Auto-connect failed", err);
        }
    }
};

const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
        try {
            provider = new ethers.BrowserProvider(window.ethereum);
            const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
            signer = await provider.getSigner();
            userWalletAddress = accounts[0];

            // Only reload if not already connected
            const alreadyConnected = localStorage.getItem('walletConnected') === 'true';
            localStorage.setItem('walletConnected', 'true');
            updateUIOnConnect();
            closeModal('walletModal');
            showToast("Wallet Connected!");

            if (!alreadyConnected) {
                setTimeout(() => {
                    location.reload();
                }, 300);
            }

            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length === 0) disconnectWallet();
                else {
                    userWalletAddress = accounts[0];
                    updateUIOnConnect();
                    setTimeout(() => {
                        window.switchView('market');
                    }, 300);
                }
            });
        } catch (err) {
            showToast("Wallet connection failed.");
        }
    } else {
        showToast("Please install MetaMask!");
    }
};

const disconnectWallet = () => {
    userWalletAddress = null;
    localStorage.removeItem('walletConnected');
    location.reload();
};
async function refreshBalance() {
    try {
        if (!provider) provider = new ethers.BrowserProvider(window.ethereum);
        if (!userWalletAddress) return;
        const balance = await provider.getBalance(userWalletAddress);
        const balanceEl = document.getElementById('userBalance');
        if (balanceEl) balanceEl.innerText = `${parseFloat(ethers.formatEther(balance)).toFixed(4)} ETH`;
    } catch (e) {
        console.warn('refreshBalance failed', e);
    }
}
const updateUIOnConnect = async () => {
    const connectBtn = document.getElementById('connectBtn');
    if (connectBtn) {
        connectBtn.innerHTML = `<i data-lucide="user"></i> ${shortenAddress(userWalletAddress)}`;
        // When connected, clicking the address shows account transaction history
        connectBtn.onclick = () => showAccountHistory(userWalletAddress);
        connectBtn.style.cursor = 'pointer';
    }
    
    document.getElementById('disconnectBtn')?.classList.remove('hidden');
    document.getElementById('wallet-notice')?.classList.add('hidden');
    document.getElementById('mintOpenBtn')?.classList.remove('hidden');
    document.getElementById('assets-locked')?.classList.add('hidden');
    document.getElementById('myAssetsGrid')?.classList.remove('hidden');
    
    const displayAddr = document.getElementById('displayAddress');
    if (displayAddr) displayAddr.innerText = userWalletAddress;

    try {
        await refreshBalance();
    } catch (e) {}
    
    lucide.createIcons();
};

// --- 4. FIRESTORE SUBSCRIPTIONS ---

const subscribeToMarketplace = () => {
    if (!auth.currentUser) return;
    const marketRef = collection(db, 'artifacts', appId, 'public', 'data', 'marketItems');
    if (!window._marketItemsCache) window._marketItemsCache = {};
    onSnapshot(marketRef, async (snapshot) => {
        const items = [];
        snapshot.forEach(doc => items.push({ id: doc.id, ...doc.data() }));

        // Detect owner changes and create a transaction doc if sale detected (best-effort)
        try {
            for (const change of snapshot.docChanges()) {
                const id = change.doc.id;
                const newData = change.doc.data();
                const prevData = window._marketItemsCache[id];

                if (change.type === 'modified' && prevData && prevData.owner && newData.owner && prevData.owner !== newData.owner) {
                    // owner changed - consider this a sale (only if not already recorded)
                    try {
                        const txRef = collection(db, 'artifacts', appId, 'public', 'data', 'transactions');
                        const q = query(txRef, where('itemId', '==', id), orderBy('timestamp', 'desc'), limit(5));
                        const recent = await getDocs(q);
                        let exists = false;
                        recent.forEach(d => {
                            const data = d.data();
                            if (data && data.buyer && data.seller) {
                                if (data.buyer.toLowerCase() === (newData.owner || '').toLowerCase() && data.seller.toLowerCase() === (prevData.owner || '').toLowerCase()) {
                                    exists = true;
                                }
                            }
                        });
                        if (!exists) {
                            await addDoc(txRef, {
                                itemId: id,
                                itemName: newData.name || ('Item ' + id),
                                price: newData.price || prevData.price || 0,
                                buyer: newData.owner,
                                seller: prevData.owner,
                                type: 'SALE',
                                timestamp: serverTimestamp()
                            });
                        }
                    } catch (e) {
                        console.warn('auto-create transaction failed', e);
                    }
                }

                // update local cache
                window._marketItemsCache[id] = newData;
            }
        } catch (e) {
            console.warn('Error processing market snapshot changes', e);
        }

        renderMarket(items);
    });
};

const subscribeToHistory = () => {
    if (!auth.currentUser) return;
    const historyRef = collection(db, 'artifacts', appId, 'public', 'data', 'transactions');
    onSnapshot(historyRef, (snapshot) => {
        const logs = [];
        snapshot.forEach(doc => logs.push(doc.data()));
        window.marketTransactions = logs;
        renderDefaultHistory();
    });
};

// Render the default transactions view: if connected, show only user-related txns; otherwise show all
function renderDefaultHistory() {
    const logs = window.marketTransactions || [];
    let toShow = logs;
    const container = document.getElementById('history-list');
    const clearBtn = document.getElementById('clearFilterBtn');
    if (!userWalletAddress) {
        // When disconnected: lock transactions view (show message), but keep marketplace active
        if (container) container.innerHTML = '<p style="color: var(--text-dim); text-align: center; padding: 20px;">Connect your wallet to view your transactions.</p>';
        if (clearBtn) clearBtn.classList.add('hidden');
        return;
    }
    if (userWalletAddress) {
        const addr = userWalletAddress.toLowerCase();
        toShow = logs.filter(l => (l.buyer && l.buyer.toLowerCase() === addr) || (l.seller && l.seller.toLowerCase() === addr));
    }
    renderHistory(toShow, 'history-list');
    // hide clear filter when showing the default
    if (clearBtn) clearBtn.classList.add('hidden');
}

// --- 5. UI RENDERING ---

// Store items globally for timer access
window.marketItems = [];

const renderResaleCountdownHTML = (item) => {
    const now = Math.floor(Date.now() / 1000);
    const boughtAt = (item.lastBoughtTimestamp && typeof item.lastBoughtTimestamp === 'object') ? item.lastBoughtTimestamp.seconds : item.lastBoughtTimestamp;
    if (!boughtAt) return '';
    const unlockAt = boughtAt + 3600;
    const secondsLeft = unlockAt - now;
    if (secondsLeft > 0) {
        return `<div class="resale-countdown"><span class="resale-timer" data-unlock="${unlockAt}" data-item="${item.id}">Resale in ${formatTime(secondsLeft)}</span></div>`;
    } else {
        return `<div class="resale-countdown resale-ready"><i data-lucide="check-circle"></i> Ready to Resell</div>`;
    }
};

const updateCountdownTimers = () => {
    document.querySelectorAll('.resale-timer').forEach(el => {
        const unlockAt = parseInt(el.getAttribute('data-unlock'), 10);
        const itemId = el.getAttribute('data-item');
        const now = Math.floor(Date.now() / 1000);
        const secondsLeft = unlockAt - now;
        if (secondsLeft > 0) {
            el.textContent = `Resale in ${formatTime(secondsLeft)}`;
        } else {
            const parent = el.parentElement;
            if (parent) {
                parent.innerHTML = '<div class="resale-countdown resale-ready"><i data-lucide="check-circle"></i> Ready to Resell</div>';
                lucide.createIcons();
                // enable associated List button if present
                if (itemId) {
                    const listBtn = document.querySelector(`button[data-item="${itemId}"][data-action="list"]`);
                    if (listBtn) {
                        listBtn.removeAttribute('disabled');
                        listBtn.style.opacity = '';
                        listBtn.style.cursor = '';
                        listBtn.style.pointerEvents = '';
                    }
                }
            }
        }
    });
};

// Start interval for countdown updates
setInterval(updateCountdownTimers, 1000);

const renderMarket = (items) => {
    window.marketItems = items;
    const grid = document.getElementById('marketGrid');
    const myGrid = document.getElementById('myAssetsGrid');
    if (!grid || !myGrid) return;
    grid.innerHTML = ''; myGrid.innerHTML = '';

    // Get all transactions from Firestore history
    let transactions = window.marketTransactions || [];
    items.forEach(item => {
        // Find latest transaction for this item
        const tx = transactions.filter(t => t.itemId === item.id)
            .sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0))[0];
        if (tx && tx.timestamp && tx.timestamp.seconds) {
            item.lastBoughtTimestamp = tx.timestamp.seconds;
        }
        const isOwner = userWalletAddress && item.owner?.toLowerCase() === userWalletAddress.toLowerCase();
        const imgSrc = item.itemImage || 'https://via.placeholder.com/300x200?text=Asset';
        const cardHTML = `
            <div class="nft-image">
                <img src="${imgSrc}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/300x200?text=Image+Error'">
            </div>
            <div class="nft-info">
                <div class="nft-title">${item.name}</div>
                <div class="nft-meta">
                    <span>Owner: ${shortenAddress(item.owner)}</span>
                </div>
                <div class="price-row">
                    <span class="price-tag">${item.price} ETH</span>
                    ${renderActions(item, isOwner)}
                </div>
                ${isOwner && item.lastBoughtTimestamp ? renderResaleCountdownHTML(item) : ''}
            </div>
        `;

        const card = document.createElement('div');
        card.className = 'nft-card';
        card.dataset.itemId = item.id; // For countdown update
        card.innerHTML = cardHTML;

        // make card clickable (open details) but ignore clicks on buttons/links inside
        card.addEventListener('click', (e) => {
            if (e.target.closest('button') || e.target.closest('a')) return;
            showItemHistory(item.id);
        });

        // Phân loại hiển thị
        if (isOwner) {
            myGrid.appendChild(card);
        }
        
        if (item.isListed) {
            // Clone node để không bị mất card khi append vào 2 chỗ
            const marketCard = card.cloneNode(true);
            // attach click handler to clone as well
            marketCard.addEventListener('click', (e) => {
                if (e.target.closest('button') || e.target.closest('a')) return;
                showItemHistory(item.id);
            });
            grid.appendChild(marketCard);
        }
    });

    if (grid.innerHTML === '') grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-dim);">No items currently listed on the market.</p>';
    
    lucide.createIcons();
};

const renderActions = (item, isOwner) => {
    if (isOwner) {
        // Normalize lastBoughtTimestamp to seconds
        const boughtAt = (item.lastBoughtTimestamp && typeof item.lastBoughtTimestamp === 'object') ? item.lastBoughtTimestamp.seconds : item.lastBoughtTimestamp;
        const now = Math.floor(Date.now() / 1000);
        const canResell = !boughtAt || (now >= (boughtAt + 3600));
        if (item.isListed) {
            return `<button class="btn-outline" style="color: #ef4444; border-color: #ef4444;" onclick="updateListing('${item.id}', false)">Delist</button>`;
        } else {
            // add data attributes so updater can enable the button when countdown ends
            const baseStyle = 'background: #22c55e;';
            const disabledStyle = 'opacity:0.5; cursor:not-allowed; pointer-events: none;';
            const styleAttr = canResell ? baseStyle : `${baseStyle} ${disabledStyle}`;
            // Show List + Edit Price buttons when not listed
            return `
                <button class="btn-primary" data-item="${item.id}" data-action="list" style="${styleAttr}" onclick="updateListing('${item.id}', true)" ${canResell ? '' : 'disabled'}>List for Sale</button>
                <button class="btn-outline" style="margin-left:8px;" onclick="promptChangePrice('${item.id}', '${item.price}')">Edit Price</button>
            `;
        }
    } else {
        return `<button class="btn-primary" onclick="buyNFT('${item.id}', '${item.name}', '${item.price}', '${item.owner}')">Buy Now</button>`;
    }
};


const renderHistory = (logs, containerId = 'history-list') => {
    const container = document.getElementById(containerId);
    if (!container) return;
    if (!logs || logs.length === 0) {
        container.innerHTML = '<p style="color: var(--text-dim); text-align: center; padding: 20px;">No transaction history.</p>';
        return;
    }
    logs = logs.slice().sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
    container.innerHTML = logs.map(log => `
        <div class="history-item" data-itemid="${log.itemId}">
            <div class="hist-main">
                <div class="hist-item-info">
                    <a href="#" class="history-item-link" data-itemid="${log.itemId}" style="color: var(--primary); text-decoration: none;">${log.itemName}</a>
                    <span class="type-badge ${log.type.toLowerCase()}">${log.type}</span>
                </div>
                <span class="price-tag" style="font-size: 0.9rem;">${log.price} ETH</span>
            </div>
            <div class="hist-details">
                <div class="address-flow">
                    <span>From: <strong><a href="#" class="owner-link" data-address="${log.seller}">${shortenAddress(log.seller)}</a></strong></span>
                    <i data-lucide="arrow-right" size="12"></i>
                    <span>To: <strong><a href="#" class="owner-link" data-address="${log.buyer}">${shortenAddress(log.buyer)}</a></strong></span>
                </div>
                <div class="timestamp">
                    <i data-lucide="clock" size="12"></i>
                    ${log.timestamp ? new Date(log.timestamp.seconds * 1000).toLocaleString() : 'Processing...'}
                </div>
            </div>
        </div>
    `).join('');

    // Attach delegated click handlers for item links and owner links
    container.querySelectorAll('.history-item-link').forEach(el => el.onclick = (e) => { e.preventDefault(); const id = el.getAttribute('data-itemid'); if (id) showItemHistory(id); });
    container.querySelectorAll('.owner-link').forEach(el => el.onclick = (e) => { e.preventDefault(); const addr = el.getAttribute('data-address'); if (addr) showAccountHistory(addr); });

    // Show or hide clear filter button when viewing the main history container
    if (containerId === 'history-list') {
        const clearBtn = document.getElementById('clearFilterBtn');
        if (clearBtn) {
            const total = (window.marketTransactions || []).length;
            if (!logs || logs.length === 0 || logs.length === total) clearBtn.classList.add('hidden');
            else clearBtn.classList.remove('hidden');
        }
    }

    lucide.createIcons();
};

// --- 6. DATA ACTIONS ---

window.updateListing = async (itemId, status) => {
    try {
        const itemRef = doc(db, 'artifacts', appId, 'public', 'data', 'marketItems', itemId);
        if (status) {
            // fetch tokenId and price from firestore then list on-chain
            const snap = await getDoc(itemRef);
            if (!snap.exists()) throw new Error('Item document not found');
            const data = snap.data();
            const tokenId = data.tokenId;
            const price = data.price;
            if (!tokenId) throw new Error('tokenId missing for item');
            await listItemOnChain(itemId, tokenId, price);
        } else {
            await delistItem(itemId);
            showToast('Item delisted and stored.');
        }
    } catch (e) {
        console.error(e);
        showToast('Action failed: ' + (e.message || e));
    }
};

window.buyNFT = async (itemId, name, price, seller) => {
    if (!userWalletAddress) return openModal('walletModal');
    try {
        // call on-chain purchase using the Firestore doc id
        await buyItemOnChain(itemId, price);
        showToast('Purchase Successful! Item moved to your collection.');
    } catch (e) {
        console.error(e);
        showToast('Transaction Failed: ' + (e.message || e));
    }
};
async function delistItem(firestoreDocId) {
    try { await initContracts(); } catch (e) { /* continue to Firestore update */ }

    const itemRef = doc(db, 'artifacts', appId, 'public', 'data', 'marketItems', firestoreDocId);
    const snap = await getDoc(itemRef);
    if (!snap.exists()) throw new Error('Item not found');

    const data = snap.data();
    const marketItemId = data?.marketItemId;

    if (marketItemId && marketplaceContract && typeof marketplaceContract.cancelMarketItem === 'function') {
        try {
            showToast('Cancelling on-chain listing...');
            const tx = await marketplaceContract.cancelMarketItem(BigInt(marketItemId));
            await tx.wait();
            await updateDoc(itemRef, { isListed: false });
            showToast('On-chain listing cancelled and Firestore updated');
            await refreshBalance();
            return true;
        } catch (e) {
            console.warn('On-chain cancel failed', e);
            throw e;
        }
    } else {
        await updateDoc(itemRef, { isListed: false });
        showToast('Delisted in Firestore');
        await refreshBalance();
        return true;
    }
}

async function changePrice(firestoreDocId, newPrice) {
    if (!userWalletAddress) throw new Error('Connect wallet to change price');
    const itemRef = doc(db, 'artifacts', appId, 'public', 'data', 'marketItems', firestoreDocId);
    const snap = await getDoc(itemRef);
    if (!snap.exists()) throw new Error('Item not found');
    const data = snap.data();

    const marketItemId = data?.marketItemId;

    if (data.isListed && marketItemId) {
        await initContracts();
        try {
            showToast('Updating price on-chain...');
            const newPriceWei = ethers.parseEther(newPrice.toString());
            const tx = await marketplaceContract.updateMarketItemPrice(BigInt(marketItemId), newPriceWei);
            await tx.wait();
            showToast('On-chain price updated.');
            await refreshBalance();
        } catch (e) {
            console.warn('On-chain price update failed', e);
            throw e;
        }
    }

    await updateDoc(itemRef, { price: newPrice });
    showToast('Price updated (Firestore synchronized; on-chain updated if listing existed)');
    return true;
}

// Utility wrapper to prompt and call changePrice from UI
window.promptChangePrice = async (firestoreDocId, currentPrice) => {
    if (!userWalletAddress) return openModal('walletModal');
    const val = prompt('Enter new price in ETH', currentPrice || '');
    if (val === null) return;
    const parsed = parseFloat(val);
    if (isNaN(parsed) || parsed < 0) return showToast('Invalid price');
    try {
        await changePrice(firestoreDocId, parsed.toString());
    } catch (e) {
        console.error(e);
        showToast('Failed to change price: ' + (e.message || e));
    }
};

// Show transaction history for an account (buyer or seller)
function showAccountHistory(address) {
    const logs = (window.marketTransactions || []).filter(l => (l.buyer && l.buyer.toLowerCase() === address.toLowerCase()) || (l.seller && l.seller.toLowerCase() === address.toLowerCase()));
    // close any open modal, switch to history view and render filtered logs
    closeModal('detailsModal');
    closeModal('resaleCountdownModal');
    window.switchView('history');
    renderHistory(logs, 'history-list');
    const clearBtn = document.getElementById('clearFilterBtn');
    if (clearBtn) {
        const total = (window.marketTransactions || []).length;
        if (logs.length !== total) clearBtn.classList.remove('hidden');
        else clearBtn.classList.add('hidden');
    }
}

// Show transaction history for a specific item inside details modal
function showItemHistory(itemId) {
    const logs = (window.marketTransactions || []).filter(l => l.itemId === itemId).sort((a,b)=> (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
    const item = (window.marketItems || []).find(i => i.id === itemId) || {};
    const detailsContent = document.getElementById('detailsContent');
    const itemHistoryList = document.getElementById('itemHistoryList');
    if (detailsContent) {
        detailsContent.innerHTML = `
            <div style="display:flex;align-items:center;gap:12px;">
                <div style="width:110px;height:80px;flex-shrink:0;"><img src="${item.itemImage||'https://via.placeholder.com/300x200?text=Asset'}" style="width:100%;height:100%;object-fit:cover;border-radius:6px;"/></div>
                <div>
                    <h3 style="margin:0">${item.name || 'Item'}</h3>
                    <div style="font-size:0.9rem;color:var(--text-dim);">Owner: <a href="#" class="owner-link" data-address="${item.owner||''}">${shortenAddress(item.owner)}</a></div>
                </div>
            </div>
            <hr style="margin:12px 0;"/>
        `;
        // Make owner link in details clickable
        const ownerLink = detailsContent.querySelector('.owner-link');
        if (ownerLink) ownerLink.onclick = (e) => { e.preventDefault(); const addr = ownerLink.getAttribute('data-address'); if (addr) showAccountHistory(addr); };
    }
    if (itemHistoryList) {
        renderHistory(logs, 'itemHistoryList');
    }
    openModal('detailsModal');
}

document.getElementById('confirmMint').onclick = async () => {
    if (!userWalletAddress) return showToast('Please connect your wallet!');
    const name = document.getElementById('nftName').value;
    const price = document.getElementById('nftPrice').value;
    const itemImage = document.getElementById('nftImage').value;
    if (!name || !price) return showToast('Please fill in name and price!');

    try {
        await onChainMint(name, price, itemImage);
        closeModal('mintModal');
        showToast('Asset Minted on-chain and saved.');
        document.getElementById('nftName').value = '';
        document.getElementById('nftPrice').value = '';
        document.getElementById('nftImage').value = '';
    } catch (e) {
        console.error(e);
        showToast('Minting failed: ' + (e.message || e));
    }
};

// UI Helpers
window.openModal = (id) => {
    if (id === 'walletModal' && userWalletAddress) return; // Không hiện modal nếu đã kết nối
    const modal = document.getElementById(id);
    if(modal) modal.style.display = 'flex';
};
window.closeModal = (id) => {
    const modal = document.getElementById(id);
    if(modal) modal.style.display = 'none';
};
window.switchView = (viewId) => {
    document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`${viewId}-view`)?.classList.add('active');
    document.querySelector(`[data-view="${viewId}"]`)?.classList.add('active');
};

document.querySelectorAll('.tab-btn').forEach(btn => btn.onclick = () => switchView(btn.dataset.view));
document.getElementById('connectBtn').onclick = () => openModal('walletModal');
document.getElementById('disconnectBtn').onclick = disconnectWallet;
document.getElementById('metaMaskBtn').onclick = connectWallet;
document.getElementById('clearFilterBtn')?.addEventListener('click', () => {
    renderDefaultHistory();
    window.switchView('history');
});

function showToast(msg) {
    const t = document.getElementById('toast');
    const m = document.getElementById('toastMsg');
    if(t && m) { m.innerText = msg; t.classList.add('active'); setTimeout(() => t.classList.remove('active'), 3000); }
}

// Loading overlay helpers
function showLoading(message) {
    try {
        const overlay = document.getElementById('loadingOverlay');
        const msg = document.getElementById('loadingMessage');
        if (msg && message) msg.innerText = message;
        if (overlay) overlay.style.display = 'flex';
    } catch (e) { /* noop */ }
}
function hideLoading() {
    try {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) overlay.style.display = 'none';
    } catch (e) { /* noop */ }
}

initAuth();
checkPersistedConnection();
lucide.createIcons();
