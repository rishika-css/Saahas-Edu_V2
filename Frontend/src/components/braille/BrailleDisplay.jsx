import { textToTokens } from "../../utils/BrailleEngine";

export default function BrailleDisplay({ text }) {
  if (!text) return (
    <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center text-gray-400">
      Enter text above to see Grade 2 Braille cards...
    </div>
  );

  const tokens = textToTokens(text);
  const dotKeyMap = ["f", "d", "s", "j", "k", "l"];

  return (
    <div className="flex flex-wrap gap-4 p-6 bg-white rounded-2xl border shadow-sm">
      {tokens.map((token, idx) => {
        if (token.display === " ") return <div key={idx} className="w-10 h-24" />;

        return (
          <div key={idx} className="relative flex flex-col items-center p-3 border rounded-xl bg-gray-50 min-w-[70px]">
            {token.display.length > 1 && (
              <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-[10px] px-1.5 rounded-full font-bold">G2</span>
            )}
            
            {/* 3x2 Dot Grid */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-2 mb-3">
              {[0, 1, 2].map(row => (
                <>
                  {[0, 3].map(offset => {
                    const key = dotKeyMap[row + offset];
                    const isFilled = token.dots?.includes(key);
                    return (
                      <div 
                        key={key} 
                        className={`w-3.5 h-3.5 rounded-full transition-colors ${isFilled ? 'bg-purple-600' : 'bg-gray-200'}`}
                      />
                    );
                  })}
                </>
              ))}
            </div>
            
            <span className="text-sm font-mono font-bold text-gray-700">{token.display}</span>
          </div>
        );
      })}
    </div>
  );
}