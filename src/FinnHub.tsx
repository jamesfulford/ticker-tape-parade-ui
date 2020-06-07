import React, { useState, useRef } from 'react';
import { useEffect } from "react"
import { useLocalStorage } from './useLocalStorage';


export const FinnHub = () => {
    const [token, setToken] = useLocalStorage<string>('finnhub-token', '');
    const [tokenField, setTokenField] = useState('');

    return <>
    { token ? <FinnHubOperator token={token}/> : <form onSubmit={e => {
        e.stopPropagation();
        e.preventDefault();
        setToken(tokenField);
    }}>
        <code>Please enter API token from finnhub.io</code><br />
        <input type="text" onChange={e => setTokenField(e.target.value)} value={tokenField} />
    </form>}
    </>
}

export const FinnHubOperator = ({ token }: { token: string }) => {
    const [socket, setSocket] = useState();

    const [tickers, setTickers] = useLocalStorage<string[]>('tickers-list', []);

    const [latest, setLatest] = useState<{ [ticker: string]: { v: number, p: number }}>({});

    // Manage connection to finnhub
    useEffect(() => {
        const socket = new WebSocket(`wss://ws.finnhub.io?token=${token}`);

        socket.addEventListener('open', () => {
            setSocket(socket);
        });

        // Update latest
        socket.addEventListener('message', function (event) {
            const message = JSON.parse(event.data);
            debugger
            if (message.type === "trade") {
                debugger
                for (let i = 0; i < message.data.length; i++) {
                    debugger
                    const { s, ...others } = message.data[i];
                    setLatest(newLatest => ({ ...newLatest, [s]: others?.p }));
                }
            }
        });

        return () => socket.close();
    }, [token]);

    // Manage tickers subscription list
    const registryRef = useRef(new Set<string>());
    useEffect(() => {
        if(!socket) { return; }
        tickers.forEach(t => {
            if (!registryRef.current.has(t)) {
                socket.send(JSON.stringify({type: 'subscribe', symbol: t}));
                registryRef.current.add(t);
            }
        });
        Array.from(registryRef.current.values()).forEach(t => {
            if (!tickers.includes(t)) {
                socket.send(JSON.stringify({type: 'unsubscribe', symbol: t}));
                registryRef.current.delete(t);
            }
        })
    }, [tickers, socket]);

    // Logic for adding more tickers
    const [tickerField, setTickerField] = useState('');

    return (<>
        <form onSubmit={e => {
            e.stopPropagation();
            e.preventDefault();
            if (tickerField && !tickers.includes(tickerField)) {
                setTickers([...tickers, tickerField])    
            }
            setTickerField('');
        }}>
            <input type="text" onChange={e => setTickerField(e.target.value)} value={tickerField} placeholder="Enter ticker symbol" />
        </form>
        <ul>
            {tickers.map(t => <li key={t}>{t} {t in latest ? latest[t] : '...'} <a onClick={() => {
            setTickers(tickers.filter(ti => ti !== t))
            }}>X</a></li>)}
        </ul>
    </>)
}
