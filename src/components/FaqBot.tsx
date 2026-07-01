import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageCircle,
  X,
  Send,
  Fuel,
  Sparkles,
} from 'lucide-react';
import { PRODUCTS, FLAT_DELIVERY_FEE, RETURNING_DISCOUNT_RATE } from '@/lib/pricing';
import { formatNaira } from '@/lib/format';
import { COMPANY } from '@/lib/company';

interface Msg {
  id: number;
  from: 'bot' | 'user';
  text: string;
}

interface FaqEntry {
  q: string;
  a: string;
}

function buildFaq(): FaqEntry[] {
  const dieselPrice = PRODUCTS.find((p) => p.id === 'diesel')?.pricePerLitre ?? 0;
  return [
    {
      q: 'How much is diesel per litre?',
      a: `Diesel (AGO) is currently ${formatNaira(dieselPrice)} per litre. Prices for petrol and kerosene are shown live on the Order page — they update the moment we change them, so you always see today's rate.`,
    },
    {
      q: 'How does delivery work?',
      a: `You place an order with your litres and delivery address, and we bring it straight to your doorstep. There's a flat delivery fee of ${formatNaira(
        FLAT_DELIVERY_FEE
      )} no matter the order size, so there are no surprises at checkout.`,
    },
    {
      q: 'What is the minimum order?',
      a: 'The minimum order is 200 litres for diesel, petrol and kerosene. There is no upper limit for industrial or bulk orders — just talk to us for very large volumes.',
    },
    {
      q: 'Do returning customers get a discount?',
      a: `Yes! Once you've placed one order with us, your phone number is recognised automatically and you get ${Math.round(
        RETURNING_DISCOUNT_RATE * 100
      )}% off your fuel cost on every order after that — no code needed.`,
    },
    {
      q: 'Which areas do you deliver to?',
      a: 'We currently deliver across Abuja (FCT) and are expanding to neighbouring states. Enter your city on the Order page and we\'ll confirm coverage and delivery timing for your location.',
    },
    {
      q: 'How do I actually place an order?',
      a: 'Tap "Order Now", choose diesel, petrol or kerosene, set your litres, enter your delivery address and date, then confirm. Your order is sent straight to our team on WhatsApp so we can dispatch immediately.',
    },
    {
      q: 'How do I pay?',
      a: `Payment is arranged directly with our team once your order is confirmed on WhatsApp — bank transfer is the most common option. Call us on ${COMPANY.phoneDisplay} if you'd like to set up an account for recurring orders.`,
    },
    {
      q: 'How fast is delivery?',
      a: 'Most orders within Abuja are delivered within 24–48 hours of confirmation, depending on volume and your preferred delivery date. Urgent orders can often be prioritised — just mention it on WhatsApp.',
    },
  ];
}

const WELCOME =
  "Hi! I'm the Ashco assistant. Ask me about pricing, delivery, discounts or how ordering works — or tap a question below.";

let idCounter = 1;

const FaqBot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { id: 0, from: 'bot', text: WELCOME },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const faq = useRef(buildFaq()).current;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing, open]);

  function bestAnswer(question: string): string {
    const q = question.toLowerCase();
    let best: FaqEntry | null = null;
    let bestScore = 0;
    for (const entry of faq) {
      const words = entry.q.toLowerCase().split(/\W+/).filter((w) => w.length > 3);
      const score = words.reduce((acc, w) => acc + (q.includes(w) ? 1 : 0), 0);
      if (score > bestScore) {
        bestScore = score;
        best = entry;
      }
    }
    if (best && bestScore > 0) return best.a;
    return `I don't have that exact answer on file, but our team will know — call ${COMPANY.phoneDisplay} or tap "Order Now" and add your question in the notes field.`;
  }

  function send(text: string) {
    if (!text.trim()) return;
    const userMsg: Msg = { id: idCounter++, from: 'user', text: text.trim() };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setTyping(true);
    const answer = bestAnswer(text);
    const delay = 450 + Math.min(answer.length * 6, 900);
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { id: idCounter++, from: 'bot', text: answer }]);
    }, delay);
  }

  return (
    <>
      {/* Floating launcher */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-8 left-8 z-40 w-14 h-14 rounded-full bg-ashco-green text-white shadow-xl hover:bg-ashco-green-dark transition-all duration-300 flex items-center justify-center group"
        aria-label="Open Ashco assistant"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        {!open && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-ashco-yellow rounded-full flex items-center justify-center">
            <Sparkles className="w-2.5 h-2.5 text-ashco-black" />
          </span>
        )}
      </button>

      {/* Panel */}
      <div
        className={`fixed bottom-24 left-4 sm:left-8 z-40 w-[calc(100vw-2rem)] sm:w-96 max-h-[70vh] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden transition-all duration-300 origin-bottom-left ${
          open ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-95 opacity-0 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="bg-ashco-green text-white p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-ashco-yellow flex items-center justify-center flex-shrink-0">
            <Fuel className="w-5 h-5 text-ashco-black" />
          </div>
          <div>
            <div className="font-display font-bold text-sm">Ashco Assistant</div>
            <div className="text-[11px] text-white/70">Answers common questions instantly</div>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-ashco-gray">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  m.from === 'user'
                    ? 'bg-ashco-green text-white rounded-br-sm'
                    : 'bg-white text-ashco-black shadow-sm rounded-bl-sm'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          {typing && (
            <div className="flex justify-start">
              <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" />
              </div>
            </div>
          )}

          {/* Quick questions (only while conversation is short) */}
          {messages.length <= 1 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {faq.slice(0, 4).map((f) => (
                <button
                  key={f.q}
                  onClick={() => send(f.q)}
                  className="text-xs font-medium bg-white border border-gray-200 text-ashco-black rounded-full px-3 py-1.5 hover:border-ashco-green hover:text-ashco-green transition-colors"
                >
                  {f.q}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Order CTA */}
        <div className="px-4 pt-2">
          <Link
            to="/order"
            onClick={() => setOpen(false)}
            className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-ashco-green hover:text-ashco-green-dark transition-colors"
          >
            <Fuel className="w-3.5 h-3.5" /> Skip the chat — place an order now
          </Link>
        </div>

        {/* Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="p-3 border-t flex items-center gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question…"
            className="flex-1 text-sm border border-gray-200 rounded-full px-4 py-2.5 focus:border-ashco-green outline-none"
          />
          <button
            type="submit"
            className="w-10 h-10 rounded-full bg-ashco-yellow text-ashco-black flex items-center justify-center hover:bg-ashco-yellow-dark transition-colors flex-shrink-0"
            aria-label="Send"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </>
  );
};

export default FaqBot;
