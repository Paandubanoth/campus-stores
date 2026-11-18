# Campus Stores

> **Reviewers:** my write-up is in [My submission](#my-submission) below. The prototype is live in the app: open `index.html` and go to **Loan register → Check in a unit**. The changes are in `app.js` and `styles.css`.

## My submission

### My shift

1. **3:45 pm pickup.** I read RQ-214 and Isha's desk-book note, then issued three slips in Kabir's name: PR-04 projector, SP-02 speaker, AD-12 adapter, due Fri 8 pm.
2. **7:30 pm return.** Kabir brought back the projector and speaker. I closed those two slips, left AD-12 open, and wrote a free-text handover note saying Leela has the adapter and will bring it at 9 am.
3. **Saturday 9 am.** Leela walked in with an adapter. I had to work out which open slip it belonged to and close it.

### A moment the product handles well: issuing the kit

The issue slip is tied to the approved request, and there is one slip per physical unit.

- The form never offered PR-06, which is in repair.
- When I tried to put the wireless mic on RQ-214, it was refused because the mic isn't on the approved form.
- A second adapter on the same request was also refused, because the approved quantity was already on loan.

Because each unit has its own slip, the partial return at 7:30 pm was easy to record: two slips closed and one stayed open. I would keep all of this unchanged.

### A moment I would change: closing the loan the next morning

At 9 am the register showed two outstanding rows, each with a one-click **Record return** button:

- `L-404 · AD-12`: due Fri 8 pm, collected by Kabir Sen
- `L-401 · MI-09`: due Sat 10 am, collected by Tara Shah

Several things made this risky:

- **IDs only.** The rows didn't say which was the adapter. I had to cross-check Inventory, where AD-12 and AD-15 are two adapters from the same bin (C4).
- **Nothing linked Leela to the loan.** The slip said "Kabir Sen". Her name and the 9 am promise existed only as free text in the desk book.
- **No overdue flag** on a slip that was due 13 hours earlier.
- **No confirmation and no undo.** One misclick on the wrong row silently closes Tara's mic loan, and the desk then believes a microphone is on the shelf when it isn't.

The core problem: the return starts from a list of records, not from the object in the person's hand.

### My change: check in by the tag on the unit, and save the missing units on the slip

**1. Check in a unit.**
- You type the tag on the equipment in your hand (`ad12`, `AD 12` and `AD-12` all work).
- The app opens that unit's slip and shows the type, model, home bin, request, who collected it, the due time with an **Overdue** flag, and the state of the rest of the kit.
- You choose **Returned by** and confirm **Close slip L-404**.
- If the tag has no open slip (for example AD-15, which is on the shelf), the app says so and lists the open slips for that type instead of closing anything.

**2. Partial return prompt.**
- When a return leaves part of a kit out, a prompt says "2 of 3 units back. Still out: AD-12 · USB-C → HDMI adapter". It asks who has the missing unit now and when it will come back.
- The answer is saved on the slip ("Now with Leela Das, expected Sat 9 am") and posted to the desk book automatically.
- The prompt sits below the tag box, so the desk can check in everything on the counter first.

**3. Clearer register.**
- Rows show the unit type, club, overdue flag, the current holder, and who returned each unit and when.
- Each return can be undone right after it is made.

**The same job with the change:**
- **7:30 pm:** I check in PR-04 and SP-02. The prompt asks where AD-12 is, and I pick Leela Das and Sat 9 am. The slip and the desk book now both say so.
- **9 am:** the new shift opens the register and sees `L-404 · AD-12 · USB-C → HDMI adapter` marked **Overdue**, "Now with Leela Das, expected Sat 9 am". Leela hands over the adapter. I type the tag from its label, the card matches her and the slip, and I close L-404 with her as the returner. Tara's mic slip is never at risk.

**What I kept:** the request-bound issue form and its checks, one slip per unit, the desk book, and the overall layout. The issue flow is unchanged.

**What I'd watch at a real counter:**
- For one week, count how often staff close a slip and then reopen it, or later find the wrong unit marked out (for example, the inventory says an adapter is on the shelf but it isn't).
- Time how long a morning shift takes from someone walking up with equipment to the slip being closed.

If the change helps, both numbers should fall, and staff should stop opening the desk book to answer "who has this?"

---


Campus Stores is a Product Engineer work sample set at a fictional campus media equipment desk. Work through a club’s screening, from equipment pickup to a partial return and the next morning’s handover. Open **Candidate brief** in the app for the assignment.

## Run the app

Open `index.html` in a modern browser. The app includes its scripts, styles, and icons and can run offline.

To serve it over local HTTP, run this from the repository folder and visit `http://localhost:8000`.

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Each browser stores its own sample shift locally when browser storage is available. **Restart sample shift** restores the fictional starting records.

## Source

- `index.html` contains the desk layout, candidate brief, and bundled icons.
- `app.js` contains the sample records and interactions.
- `styles.css` defines the desktop and mobile layouts.

Icon license notices are in [third-party/lucide-LICENSE.txt](third-party/lucide-LICENSE.txt).


## Submit your work

1. [Fork Campus Stores](https://github.com/virinchi-healthcare/campus-stores/fork) into your GitHub account. Complete the candidate brief and push your changes to your public fork. In your README, point reviewers to your work and explain the decision you made.
2. In your fork, open **Commits**, select the final commit you want reviewed, and copy the page URL. It should look like `https://github.com/YOUR-USERNAME/campus-stores/commit/COMMIT-SHA`.
3. [Submit your work through the Google Form](https://docs.google.com/forms/d/e/1FAIpQLScvzoh1R4WS-SkiwAVBQbMvniieJYSoOEfLMyVo5CyjOvYUgQ/viewform). Your **roll number**, **email ID**, and **final commit link from your public fork** are required. Enter your roll number and email ID in the form only.
