import {
  COLLEGE_DOMAIN,
  DEPOSIT_SHARE,
  MAX_ITEM_VALUE,
  MAX_PHOTOS,
  MAX_RENTAL_DAYS,
  MAX_RENT_SHARE,
  MIN_DEPOSIT,
  MIN_ITEM_VALUE,
  MIN_RENT,
  NEW_USER_VALUE_LIMIT,
  blockedExamples,
  depositFor,
  formatRupees,
  maxRentFor,
  suggestedRentFor,
} from "./data";

const PICKUP = ["Main Block", "Library", "Hostel A", "Hostel B", "Girls Hostel", "Sports Complex", "Auditorium"];

const BLOCKED_ITEMS = [
  { pattern: /\b(make\s?up|lipsticks?|cosmetics?|kajal|trimmers?|razors?|combs?)\b/, why: blockedExamples[0] },
  { pattern: /\b(earphones?|earbuds?|innerwear|underwear|socks?|shoes?|helmets?)\b/, why: blockedExamples[1] },
  { pattern: /\b(calculators?|geometry box(?:es)?|notes?|notebooks?|books?)\b/, why: blockedExamples[2] },
  { pattern: /\b(chargers?|cables?|pens?|pencils?|batteries)\b/, why: blockedExamples[3] },
  { pattern: /\b(phones?|laptops?|macbooks?)\b/, why: blockedExamples[4] },
  { pattern: /\b(food|snacks?|medicines?|fog machines?|alcohol|cigarettes?|beer)\b/, why: blockedExamples[5] },
];

const ALLOWED_ITEMS = [
  { pattern: /\b(cameras?|lenses|gimbals?|tripods?|mics?|microphones?)\b/, name: "Cameras and creator gear" },
  { pattern: /\b(projectors?|monitors?|speakers?)\b/, name: "Tech and gadgets" },
  { pattern: /\b(arduinos?|raspberry pis?|dev boards?|tablets?|soldering|tool kits?)\b/, name: "Project and lab kits" },
  { pattern: /\b(guitars?|keyboards?|instruments?|tablas?|cajons?|harmoniums?)\b/, name: "Musical instruments" },
  { pattern: /\b(bikes?|bicycles?|cycles?|cricket|racquets?|badminton|skateboards?|sports gear)\b/, name: "Sports and cycling" },
  { pattern: /\b(tents?|rucksacks?|sleeping bags?|trekking poles?|suitcases?)\b/, name: "Travel and trekking gear" },
  { pattern: /\b(stage lights?|par lights?|event lights?|wireless mics?)\b/, name: "Event lights and sound" },
  { pattern: /\b(blazers?|formal wear|formals)\b/, name: "Formal wear" },
];

export const starterQuestions = [
  "How does the deposit work?",
  "How many days can I borrow?",
  "What can't I list?",
  "Which email can I use?",
];

export const openingMessage =
  "Ask me about BorrowBox rules: deposit, rent, how long a rental can last, your college account, or what you can and can't list. I only use the rules already on the site.";

const refusal =
  "I only answer BorrowBox rules — accounts, what you can list, rent, deposit, dates, damage, and handover. That isn't covered, so I won't guess a policy.";

function clean(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/₹/g, " rs ")
    .replace(/\s+/g, " ")
    .trim();
}

function moneyAmounts(question) {
  return [...question.matchAll(/\b(\d{1,3}(?:,\d{3})+|\d{2,6})\b/g)]
    .filter((match) => !/days?/.test(question.slice(match.index, match.index + match[0].length + 8)))
    .map((match) => Number(match[1].replace(/,/g, "")))
    .filter((amount) => amount >= MIN_RENT && amount <= 1000000);
}

function inRange(amount) {
  return amount >= MIN_ITEM_VALUE && amount <= MAX_ITEM_VALUE;
}

function valueReply(amount) {
  if (amount < MIN_ITEM_VALUE) {
    return `Something worth ${formatRupees(amount)} can't be listed. Items under ${formatRupees(MIN_ITEM_VALUE)} are cheaper to buy than rent.`;
  }
  if (amount > MAX_ITEM_VALUE) {
    return `Something worth ${formatRupees(amount)} can't be listed. Items over ${formatRupees(MAX_ITEM_VALUE)} are too risky to cover with a student deposit.`;
  }
  return `An item worth ${formatRupees(amount)} is inside the listing range of ${formatRupees(MIN_ITEM_VALUE)}–${formatRupees(MAX_ITEM_VALUE)}. Deposit would be ${formatRupees(depositFor(amount))}. Daily rent can be ${formatRupees(MIN_RENT)}–${formatRupees(maxRentFor(amount))}, and the suggested rent is ${formatRupees(suggestedRentFor(amount))}/day.`;
}

function itemReply(question) {
  const blocked = BLOCKED_ITEMS.find((entry) => entry.pattern.test(question));
  if (blocked) {
    return `${blocked.why.what} can't be listed. ${blocked.why.why}`;
  }
  const allowed = ALLOWED_ITEMS.find((entry) => entry.pattern.test(question));
  if (allowed) {
    return `${allowed.name} can be listed, as long as the item is worth ${formatRupees(MIN_ITEM_VALUE)}–${formatRupees(MAX_ITEM_VALUE)} and you have real photos of it.`;
  }
  if (/\b(list|rent out|lend|share)\b/.test(question) && /\b(this|that|it|something|item)\b/.test(question)) {
    return `List it only if it costs ${formatRupees(MIN_ITEM_VALUE)}–${formatRupees(MAX_ITEM_VALUE)}, is needed for a few days, and is safe to share. Personal, everyday, and consumable items are refused.`;
  }
  return "";
}

const topics = [
  {
    id: "overview",
    when: (question) => /\b(all (the )?rules|every rule|how (does|do) (this|borrowbox|it) work|what is borrowbox|explain|overview|policy)\b/.test(question),
    reply: () =>
      `BorrowBox is campus-only. Sign in with a ${COLLEGE_DOMAIN} email. List gear worth ${formatRupees(MIN_ITEM_VALUE)}–${formatRupees(MAX_ITEM_VALUE)}, or request it for 1–${MAX_RENTAL_DAYS} days. Rent starts at ${formatRupees(MIN_RENT)}/day and can't pass ${MAX_RENT_SHARE * 100}% of the item's price. The deposit is ${DEPOSIT_SHARE * 100}% of the price (minimum ${formatRupees(MIN_DEPOSIT)}), paid in cash or UPI when you meet. There is no delivery and no online payment.`,
  },
  {
    id: "deposit",
    when: (question) => /\b(deposits?|refund|security money|get .+ back)\b/.test(question),
    reply: () =>
      `The deposit is ${DEPOSIT_SHARE * 100}% of the item's original price, and at least ${formatRupees(MIN_DEPOSIT)}. You pay it to the owner at handover by cash or UPI, together with the rent. It comes back when the item is returned safely. Normal wear is free. Minor damage is paid from the deposit, up to that amount.`,
  },
  {
    id: "rent",
    when: (question) =>
      /\b(rents?|price per day|per day|daily|charges?)\b/.test(question) ||
      (/\b(how much|what does it cost|costs?)\b/.test(question) && !/\bdeposits?\b/.test(question)),
    reply: () =>
      `Rent starts at ${formatRupees(MIN_RENT)}/day. The owner sets it, and it can't be more than ${MAX_RENT_SHARE * 100}% of the item's original price per day. The suggested rent is about 2.5% of the price. You pay the owner in cash or UPI at handover. BorrowBox does not take payment online.`,
  },
  {
    id: "days",
    when: (question) => /\b(days?|duration|how long|weeks?|months?|keep it|rental length)\b/.test(question),
    reply: (question) => {
      if (/\bmonths?\b/.test(question)) {
        return `A month is too long. Rentals run from 1 to ${MAX_RENTAL_DAYS} days.`;
      }
      const named = question.match(/\b(\d+)\s*days?\b/);
      if (named) {
        const days = Number(named[1]);
        if (days >= 1 && days <= MAX_RENTAL_DAYS) {
          return `${days} ${days === 1 ? "day is" : "days are"} allowed. Rentals can be 1–${MAX_RENTAL_DAYS} days.`;
        }
        return `${days} days is over the limit. Rentals stop at ${MAX_RENTAL_DAYS} days.`;
      }
      if (/\btwo weeks\b/.test(question)) return `Two weeks is ${MAX_RENTAL_DAYS} days, which is the maximum.`;
      if (/\bweeks?\b/.test(question)) return `A week is fine. The limit is ${MAX_RENTAL_DAYS} days.`;
      return `Rentals run from 1 to ${MAX_RENTAL_DAYS} days. Pick a start and end date on the item page. Dates that are already booked are refused.`;
    },
  },
  {
    id: "account",
    when: (question) => /\b(emails?|sign ?up|register|account|login|log in|college|bmsce|usn|who can)\b/.test(question),
    reply: () =>
      `Only a BMSCE student account works. The email must end in ${COLLEGE_DOMAIN}. The USN looks like 1BM25CS001: 1BM, a two-digit year, a two-letter branch code, and three digits. The password must be at least 6 characters.`,
  },
  {
    id: "password",
    when: (question) => /\b(passwords?|forgot|reset|can't log|cannot log|locked out)\b/.test(question),
    reply: () =>
      `The old password can't be looked up. It is stored as a hash. Use Forgot password, enter the same college email and USN you registered with, and choose a new password of at least 6 characters.`,
  },
  {
    id: "allowed",
    when: (question) => /\b(what can i (list|lend|share)|allowed items|can be listed|what to list)\b/.test(question),
    reply: () =>
      `You can list cameras, lenses, gimbals, tripods, mics, projectors, monitors, speakers, dev boards, drawing tablets, tool kits, musical instruments, sports gear, bicycles, tents, rucksacks, sleeping bags, event lights, and dry-cleaned formal wear. The item must cost ${formatRupees(MIN_ITEM_VALUE)}–${formatRupees(MAX_ITEM_VALUE)}.`,
  },
  {
    id: "blocked",
    when: (question) => /\b(can'?t list|cannot list|not allowed|banned|blocked|what (can'?t|cannot)|don'?t list|do not list)\b/.test(question),
    reply: () =>
      blockedExamples.map((entry) => `${entry.what}: ${entry.why}`).join(" "),
  },
  {
    id: "photos",
    when: (question) => /\b(photos?|pictures?|images?|upload)\b/.test(question),
    reply: () =>
      `Add 1–${MAX_PHOTOS} real photos of the actual item. JPEG, PNG, or WebP, at least 400px on each side. A listing also needs a specific title, a description of at least 20 characters, a category, a pickup point, and the dates it is free.`,
  },
  {
    id: "pickup",
    when: (question) =>
      /\b(pickup|pick up|delivery|handover|hand over|locations?)\b/.test(question) ||
      /\bwhere (do|can|to) (i|we) (pick|meet|collect|get)\b/.test(question),
    reply: () =>
      `There is no delivery. You meet the owner and pay in cash or UPI. Pickup points are ${PICKUP.join(", ")}.`,
  },
  {
    id: "damage",
    when: (question) => /\b(damag\w*|broken|breaks|lost|loss|stain|tear|wear)\b/.test(question),
    reply: () =>
      `Normal wear has no charge. Minor damage is the repair cost, up to the deposit. Major damage or loss is the depreciated value, up to the original price. Clothing and sleeping bags are cleaned by the owner between rentals. Stains or tears count as damage.`,
  },
  {
    id: "late",
    when: (question) => /\b(late|overdue|delay)\b/.test(question),
    reply: () => `A late return costs one extra day's rent for every late day.`,
  },
  {
    id: "dispute",
    when: (question) => /\b(disputes?|complaint|coordinator|admin|fight)\b/.test(question),
    reply: () =>
      `The owner can mark an active rental as disputed. Disputes go to the club coordinator or campus admin for a final decision. Two unresolved damage or late cases lead to suspension.`,
  },
  {
    id: "newuser",
    when: (question) => /\b(new user|new account|first time|suspension|suspended|limit)\b/.test(question),
    reply: () =>
      `A new account can borrow items worth up to ${formatRupees(NEW_USER_VALUE_LIMIT)} until two rentals are completed. Two unresolved damage or late cases lead to suspension.`,
  },
  {
    id: "request",
    when: (question) => /\b(requests?|accept|reject|cancel|status|book)\b/.test(question),
    reply: () =>
      `Send a request with dates from the item page. The owner can accept or reject it. You can cancel while it is still pending. After acceptance, you meet for handover. The owner then marks it handed over, and later returned or disputed. You can't request your own item, and booked dates are refused.`,
  },
  {
    id: "review",
    when: (question) => /\b(reviews?|ratings?|stars?|feedback)\b/.test(question),
    reply: () =>
      `After a rental you can leave one review per item: 1–5 stars and a comment of at least 10 characters. It is there so the next borrower knows the condition and how handover went.`,
  },
];

export function answerQuestion(raw) {
  const question = clean(raw);
  if (!question) return "Type a question about deposit, rent, dates, your account, or what you can list.";
  if (/^(hi|hello|hey|help|yo|hola)\b/.test(question) && question.split(" ").length < 5) return openingMessage;
  if (/^(thanks|thank you|thx|ok|okay|cool)\b/.test(question)) return "Ask another rule whenever you need it.";

  const replies = [];
  const amounts = moneyAmounts(question);
  const amount = amounts[0];
  const asksDeposit = /\bdeposits?\b/.test(question);
  const asksRent = /\b(rents?|per day|daily)\b/.test(question);
  const asksValue = /\b(worth|valued|value|costs?|priced|original price)\b/.test(question);

  if (amount && (asksValue || (asksDeposit && asksRent))) replies.push(valueReply(amount));
  else if (amount && asksDeposit) {
    if (!inRange(amount)) replies.push(valueReply(amount));
    else replies.push(`For an item worth ${formatRupees(amount)}, the deposit is ${formatRupees(depositFor(amount))}. That is ${DEPOSIT_SHARE * 100}% of the price, with a minimum of ${formatRupees(MIN_DEPOSIT)}. Pay it in cash or UPI at handover. It comes back if nothing is damaged.`);
  } else if (amount && asksRent) {
    if (!inRange(amount)) replies.push(valueReply(amount));
    else replies.push(`For an item worth ${formatRupees(amount)}, rent can be ${formatRupees(MIN_RENT)}–${formatRupees(maxRentFor(amount))} per day. The suggested rent is ${formatRupees(suggestedRentFor(amount))}/day.`);
  } else if (amount && asksValue) replies.push(valueReply(amount));
  else if (amount && /\b(list|borrow|rent)\b/.test(question)) replies.push(valueReply(amount));

  const namedItem = itemReply(question);
  if (namedItem && /\b(list|rent|borrow|lend|share|allowed|can i|can't|cannot)\b/.test(question)) replies.push(namedItem);

  for (const topic of topics) {
    if (!topic.when(question)) continue;
    if (topic.id === "deposit" && replies.some((line) => /deposit (is|would be)/i.test(line))) continue;
    if (topic.id === "rent" && replies.some((line) => line.includes("per day"))) continue;
    replies.push(topic.reply(question));
  }

  if (!replies.length) return refusal;
  return [...new Set(replies)].slice(0, 3).join("\n\n");
}
