(() => {
  const storageKey = "campus-stores.shift.v2";
  const root = document.getElementById("campus-stores");
  const q = (selector) => root.querySelector(selector);
  const requests = [
    {
      id: "RQ-214",
      club: "Film Society",
      event: "Courtyard screening",
      owner: "Isha Rao",
      due: "Fri 8 pm",
      items: ["HDMI projector", "Portable speaker", "USB-C → HDMI adapter"],
      note: "Playback is from a USB-C-only laptop. The host will collect at 4 pm.",
    },
    {
      id: "RQ-209",
      club: "Debate Union",
      event: "Finals rehearsal",
      owner: "Tara Shah",
      due: "Sat 10 am",
      items: ["Wireless microphone"],
      note: "Rehearsal runs into the evening.",
    },
    {
      id: "RQ-217",
      club: "Photo Circle",
      event: "Street portrait walk",
      owner: "Dev Menon",
      due: "Sat noon",
      items: ["Digital camera"],
      note: "Collection on Saturday morning.",
    },
  ];
  const assets = [
    { id: "PR-04", type: "HDMI projector", model: "BenQ MH550", bin: "A2" },
    {
      id: "PR-06",
      type: "HDMI projector",
      model: "Epson EB-X49",
      bin: "Workshop",
      repair: true,
    },
    { id: "SP-02", type: "Portable speaker", model: "JBL Eon One", bin: "B1" },
    { id: "SP-05", type: "Portable speaker", model: "Bose S1", bin: "B2" },
    {
      id: "AD-12",
      type: "USB-C → HDMI adapter",
      model: "Belkin AVC002",
      bin: "C4",
    },
    {
      id: "AD-15",
      type: "USB-C → HDMI adapter",
      model: "Anker A8312",
      bin: "C4",
    },
    { id: "MI-09", type: "Wireless microphone", model: "Shure BLX", bin: "B3" },
    { id: "CA-03", type: "Digital camera", model: "Sony A6400", bin: "D2" },
  ];
  const people = [
    "Isha Rao",
    "Kabir Sen",
    "Leela Das",
    "Tara Shah",
    "Dev Menon",
  ];
  const shifts = [
    {
      time: "Friday · 3:45 pm",
      title: "Pickup at the counter",
      text: "Kabir is here for the Film Society screening. The film starts at four. Can he leave with everything he needs?",
      next: "Move to return time",
    },
    {
      time: "Friday · 7:30 pm",
      title: "The kit comes back in pieces",
      text: "Kabir has brought back the projector and speaker. “Leela still has the adapter. She’ll drop it off tomorrow at nine.” Take the return and hand over to the morning shift.",
      next: "Move to next morning",
    },
    {
      time: "Saturday · 9:00 am",
      title: "Morning shift",
      text: "You’ve just taken over. Leela walks in with an adapter. Work out what was outstanding from the screening and close the loan for the right item.",
    },
  ];
  const pages = [
    ["Requests", "clipboard-list"],
    ["Inventory", "package"],
    ["Loan register", "book-open"],
    ["Desk book", "messages-square"],
  ];
  // Minutes since Friday 00:00, so the register can tell what is overdue.
  const dueAt = {
    "Fri 8 pm": 1200,
    "Sat 9 am": 1980,
    "Sat 10 am": 2040,
    "Sat noon": 2160,
  };
  const deskAt = [945, 1170, 1980];
  const shortTime = ["Fri 3:45 pm", "Fri 7:30 pm", "Sat 9:00 am"];
  const original = () => ({
    version: 2,
    tab: "Requests",
    phase: 0,
    selected: "",
    filter: "All items",
    loans: [
      {
        num: 401,
        req: "RQ-209",
        asset: "MI-09",
        who: "Tara Shah",
        due: "Sat 10 am",
        back: false,
      },
    ],
    notes: [],
    editing: false,
    checking: false,
    tag: "",
    pending: "",
    undo: 0,
    onlyOpen: true,
    notice: "Sample shift · All records are fictional.",
  });
  let s = original();
  const getAsset = (id) => assets.find((x) => x.id === id);
  const getReq = (id) => requests.find((x) => x.id === id);
  const out = (id) => s.loans.find((l) => l.asset === id && !l.back);
  const esc = (x) =>
    String(x).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const opts = (list, selected) =>
    list
      .map(
        ([v, t]) =>
          '<option value="' +
          esc(v) +
          '"' +
          (v === selected ? " selected" : "") +
          ">" +
          esc(t) +
          "</option>",
      )
      .join("");
  const unitName = (id) => id + " · " + getAsset(id).type;
  const overdue = (l) => !l.back && dueAt[l.due] < deskAt[s.phase];
  const warn = (t) => '<span class="tag warn">' + esc(t) + "</span>";
  // Accept "ad12", "AD 12" or "AD-12" as typed from a physical label.
  const normaliseTag = (t) =>
    String(t)
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .replace(/^([A-Z]+)(\d+)$/, "$1-$2");
  const btn = (label, act, val = "", style = "") =>
    '<button type="button" data-action="' +
    act +
    '" data-val="' +
    esc(val) +
    '" class="' +
    style +
    '">' +
    esc(label) +
    "</button>";
  const head = (title, sub, control = "") =>
    '<div class="sectionhead"><div><h2>' +
    title +
    "</h2><small>" +
    sub +
    "</small></div>" +
    control +
    "</div>";
  const row = (label, sub, right) =>
    '<div class="row"><div><strong>' +
    esc(label) +
    "</strong><small>" +
    esc(sub) +
    "</small></div><div>" +
    right +
    "</div></div>";
  const badge = (t, good = false) =>
    '<span class="tag' + (good ? " good" : "") + '">' + esc(t) + "</span>";
  function requestPage() {
    let html = head(
      "Approved requests",
      "Student Activities Office · 3 approved forms",
    );
    if (s.selected) {
      const r = getReq(s.selected);
      html +=
        btn("Back to list", "close") +
        '<div class="record"><small>' +
        r.id +
        " · Approved</small><h3>" +
        r.event +
        "</h3><p>" +
        r.club +
        " · Filed by " +
        r.owner +
        "</p><p><b>Return by</b> " +
        r.due +
        "</p><p><b>Approved equipment</b></p><ul>" +
        r.items.map((x) => "<li>" + x + "</li>").join("") +
        "</ul><p>" +
        r.note +
        "</p></div>";
    } else
      html += requests
        .map((r) =>
          row(
            r.event,
            r.id + " · " + r.club,
            btn("View form", "request", r.id),
          ),
        )
        .join("");
    return html;
  }
  function inventory() {
    let html = head(
      "Inventory",
      "Physical units · home shelf and current availability",
    );
    html +=
      '<div class="buttons"><label>Show <select data-filter>' +
      opts(
        ["All items", "On shelf", "On loan", "In repair"].map((f) => [f, f]),
      ) +
      "</select></label></div>";
    for (const a of assets) {
      const status = a.repair
        ? "In repair"
        : out(a.id)
          ? "On loan"
          : "On shelf";
      if (s.filter !== "All items" && s.filter !== status) continue;
      html += row(
        a.id + " · " + a.type,
        a.model + " · " + a.bin,
        badge(status, status === "On shelf"),
      );
    }
    return html;
  }
  // Returns start from the unit in hand, not from a row in a list.
  function checkinPanel() {
    let html =
      '<form data-find class="checkin"><div class="form"><label class="full"><span>Tag on the unit in your hand</span><input name="tag" autocomplete="off" spellcheck="false" placeholder="e.g. PR-04" value="' +
      esc(s.tag) +
      '" required /></label></div><button type="submit">Find slip</button></form>';
    if (!s.tag) return html;
    const unit = getAsset(s.tag);
    const l = unit && out(unit.id);
    if (!unit)
      return (
        html +
        '<div class="record alert"><h3>No unit is tagged “' +
        esc(s.tag) +
        "”</h3><p>Check the label on the equipment and try again.</p></div>"
      );
    if (!l) {
      const same = s.loans.filter(
        (o) => !o.back && getAsset(o.asset).type === unit.type,
      );
      return (
        html +
        '<div class="record alert"><h3>' +
        esc(unitName(unit.id)) +
        " has no open slip</h3><p>Records show it " +
        (unit.repair
          ? "in the repair workshop"
          : "on shelf " + esc(unit.bin)) +
        ". Check the tag again before closing any slip.</p>" +
        (same.length
          ? "<p><b>Open slips for this type</b></p><ul>" +
            same
              .map(
                (o) =>
                  "<li>" +
                  esc(
                    "L-" +
                      o.num +
                      " · " +
                      o.asset +
                      " · " +
                      getReq(o.req).club +
                      " · collected by " +
                      o.who,
                  ) +
                  "</li>",
              )
              .join("") +
            "</ul>"
          : "") +
        "</div>"
      );
    }
    const r = getReq(l.req);
    const rest = s.loans.filter((o) => o.req === l.req && o !== l);
    return (
      html +
      '<form data-return class="record"><small>' +
      esc("Slip L-" + l.num + " · " + r.id + " · " + r.club) +
      "</small><h3>" +
      esc(unitName(unit.id)) +
      "</h3><p>" +
      esc(unit.model + " · home bin " + unit.bin) +
      "</p><p>" +
      esc("Collected by " + l.who + " · Due " + l.due) +
      " " +
      (overdue(l) ? warn("Overdue") : "") +
      "</p>" +
      (l.holder
        ? "<p><b>Expected from</b> " +
          esc(l.holder + " · " + l.expected) +
          "</p>"
        : "") +
      (rest.length
        ? "<p><b>Rest of this kit</b></p><ul>" +
          rest
            .map(
              (o) =>
                "<li>" +
                esc(unitName(o.asset)) +
                " — " +
                (o.back ? "returned" : "<b>still out</b>") +
                "</li>",
            )
            .join("") +
          "</ul>"
        : "") +
      '<div class="form"><label><span>Returned by</span><select name="by">' +
      opts(
        people.map((p) => [p, p]),
        l.holder || l.who,
      ) +
      '</select></label></div><input type="hidden" name="num" value="' +
      l.num +
      '" /><button type="submit" class="primary">Close slip L-' +
      l.num +
      "</button></form>"
    );
  }
  // After a partial return, ask where the missing units are while the
  // person returning them is still at the counter.
  function pendingPanel() {
    if (!s.pending) return "";
    const kit = s.loans.filter((l) => l.req === s.pending);
    const left = kit.filter((l) => !l.back && !l.holder);
    if (!left.length) return "";
    const r = getReq(s.pending);
    return (
      '<form data-followup class="record memo"><small>' +
      esc(r.id + " · " + r.club + " · partial return") +
      "</small><h3>" +
      kit.filter((l) => l.back).length +
      " of " +
      kit.length +
      " units back. Still out: " +
      esc(left.map((l) => unitName(l.asset)).join(", ")) +
      "</h3><p>Once everything on the counter is checked in: who has the rest, and when will it come back? This is saved on the slip and in the desk book for the next shift.</p>" +
      '<div class="form"><label><span>Now with</span><select name="holder">' +
      opts(
        people.map((p) => [p, p]),
        left[0].who,
      ) +
      '</select></label><label><span>Expected back</span><select name="expected">' +
      opts(
        Object.keys(dueAt).map((d) => [d, d]),
        "Sat 9 am",
      ) +
      '</select></label></div><div class="buttons"><button type="submit" class="primary">Save on slip</button>' +
      btn("Not now", "skip") +
      "</div></form>"
    );
  }
  function register() {
    let html = head(
      "Loan register",
      "One slip per physical unit",
      '<span class="headbtns">' +
        (s.editing || s.checking
          ? btn("Done", "cancel")
          : btn("New issue slip", "new") +
            btn("Check in a unit", "checkin", "", "primary")) +
        "</span>",
    );
    if (s.undo) {
      const u = s.loans.find((l) => l.num === s.undo);
      if (u && u.back)
        html +=
          '<div class="buttons undo"><span>' +
          esc("Closed slip L-" + u.num + " · " + unitName(u.asset) + ".") +
          "</span>" +
          btn("Undo", "undo") +
          "</div>";
    }
    // While checking in, the prompt sits below the tag box so every unit on
    // the counter is checked in first.
    if (s.checking) return html + checkinPanel() + pendingPanel();
    if (!s.editing) html += pendingPanel();
    if (s.editing) {
      const available = assets.filter((a) => !a.repair && !out(a.id));
      const select = (label, key, options) =>
        "<label><span>" +
        label +
        '</span><select name="' +
        key +
        '" required><option value="">Select…</option>' +
        opts(options) +
        "</select></label>";
      return (
        html +
        '<form data-issue><div class="form">' +
        select(
          "Approved request",
          "req",
          requests.map((r) => [r.id, r.id + " · " + r.club]),
        ) +
        select(
          "Unit leaving the desk",
          "asset",
          available.map((a) => [a.id, a.id + " · " + a.type]),
        ) +
        select(
          "Collected by",
          "who",
          people.map((p) => [p, p]),
        ) +
        select(
          "Return by",
          "due",
          ["Fri 8 pm", "Sat 9 am", "Sat 10 am", "Sat noon"].map((d) => [d, d]),
        ) +
        '</div><button type="submit" class="primary">Save issue slip</button></form>'
      );
    }
    html +=
      '<div class="buttons">' +
      ["Outstanding", "All slips"]
        .map(
          (v, i) =>
            '<button type="button" data-action="scope" data-val="' +
            i +
            '" aria-pressed="' +
            (s.onlyOpen === (i === 0)) +
            '">' +
            v +
            "</button>",
        )
        .join("") +
      "</div>";
    const shown = s.loans
      .filter((l) => !s.onlyOpen || !l.back)
      .slice()
      .reverse();
    if (!shown.length) html += "<p>No outstanding slips.</p>";
    for (const l of shown) {
      const r = getReq(l.req);
      let sub =
        r.id + " · " + r.club + " · Collected by " + l.who + " · Due " + l.due;
      if (l.back && l.backBy)
        sub += " · Returned by " + l.backBy + ", " + shortTime[l.backAt];
      else if (!l.back && l.holder)
        sub += " · Now with " + l.holder + ", expected " + l.expected;
      html += row(
        "L-" + l.num + " · " + unitName(l.asset),
        sub,
        l.back
          ? badge("Returned")
          : '<span class="headbtns">' +
              (overdue(l) ? warn("Overdue") : "") +
              btn("Check in…", "checkin", l.asset) +
              "</span>",
      );
    }
    return html;
  }
  function deskbook() {
    let html = head(
      "Desk book",
      "Messages from clubs and notes for the next shift",
    );
    const entries = [
      [
        "Friday · 3:20 pm",
        "Isha Rao · Film Society",
        "Kabir Sen is picking up our whole screening kit. Please issue it in his name. I’m setting up in the courtyard.",
      ],
      [
        "Friday · 3:30 pm",
        "Tara Shah · Debate Union",
        "Our microphone stays with me overnight. I’ll return it by 10 am Saturday.",
      ],
    ];
    if (s.phase >= 1)
      entries.push([
        "Friday · 7:30 pm",
        "Kabir Sen · Film Society",
        "I brought the projector and speaker. Leela Das has our adapter. She’ll be at the counter at 9 am tomorrow.",
      ]);
    for (const n of s.notes)
      entries.push([
        shifts[n.phase].time,
        n.auto ? "Loan register · partial return" : "Counter handover",
        n.text,
      ]);
    for (const [t, author, body] of entries.slice().reverse())
      html +=
        '<article class="record"><small>' +
        esc(t) +
        "</small><h3>" +
        esc(author) +
        "</h3><p>" +
        esc(body) +
        "</p></article>";
    return (
      html +
      '<form data-note><div class="form"><label class="full"><span>Note for the next shift</span><textarea name="note" rows="2" maxlength="400" required></textarea></label></div><button type="submit">Add handover note</button></form>'
    );
  }
  const screens = {
    Requests: requestPage,
    Inventory: inventory,
    "Loan register": register,
    "Desk book": deskbook,
  };
  function paint() {
    const phase = shifts[s.phase];
    q("[data-clock]").textContent = phase.time;
    q("[data-shift-title]").textContent = phase.title;
    q("[data-shift]").textContent = phase.text;
    const advance = q('[data-action="advance"]');
    advance.hidden = !phase.next;
    advance.textContent = phase.next || "";
    q("[data-nav]").innerHTML = pages
      .map(
        ([n, icon]) =>
          '<button type="button" data-action="tab" data-val="' +
          n +
          '" aria-pressed="' +
          (s.tab === n) +
          '"><svg aria-hidden="true" class="store-icon"><use href="#icon-' +
          icon +
          '"></use></svg>' +
          n +
          "</button>",
      )
      .join("");
    q("[data-page]").innerHTML = screens[s.tab]();
    if (q("[data-filter]")) q("[data-filter]").value = s.filter;
    q("[data-status]").textContent = s.notice;
  }
  function commit(msg) {
    if (msg) s.notice = msg;
    paint();
    try {
      localStorage.setItem(storageKey, JSON.stringify(s));
    } catch {
      q("[data-status]").textContent +=
        " Browser storage is unavailable. Progress lasts for this visit.";
    }
  }
  root.addEventListener("click", (e) => {
    const b = e.target.closest("[data-action]");
    if (!b) return;
    const v = b.dataset.val;
    switch (b.dataset.action) {
      case "restart":
        s = original();
        break;
      case "advance":
        if (s.phase < 2) s.phase++;
        s.notice = "Shift time updated.";
        break;
      case "tab":
        s.tab = v;
        s.editing = s.checking = false;
        s.tag = "";
        s.undo = 0;
        break;
      case "close":
        s.selected = "";
        break;
      case "request":
        s.selected = v;
        break;
      case "new":
        s.editing = true;
        s.checking = false;
        s.undo = 0;
        break;
      case "checkin":
        s.checking = true;
        s.editing = false;
        s.tag = v || "";
        break;
      case "cancel":
        s.editing = s.checking = false;
        s.tag = "";
        break;
      case "scope":
        s.onlyOpen = v === "0";
        break;
      case "skip":
        s.pending = "";
        break;
      case "undo": {
        const l = s.loans.find((l) => l.num === s.undo);
        s.undo = 0;
        if (!l || !l.back) break;
        l.back = false;
        delete l.backAt;
        delete l.backBy;
        s.notice = "Slip L-" + l.num + " reopened. " + l.asset + " is on loan.";
        break;
      }
    }
    commit();
  });
  root.addEventListener("change", (e) => {
    if (e.target.matches("[data-filter]")) {
      s.filter = e.target.value;
      commit();
    }
  });
  root.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target;
    const form = new FormData(f);
    if (f.matches("[data-note]")) {
      const text = String(form.get("note")).trim();
      if (!text) return;
      s.notes.push({ phase: s.phase, text });
      commit("Handover note saved.");
      return;
    }
    if (f.matches("[data-find]")) {
      s.tag = normaliseTag(form.get("tag"));
      commit();
      return;
    }
    if (f.matches("[data-return]")) {
      const l = s.loans.find((l) => l.num === Number(form.get("num")));
      const by = String(form.get("by"));
      if (!l || l.back || !people.includes(by)) return;
      l.back = true;
      l.backAt = s.phase;
      l.backBy = by;
      s.tag = "";
      s.undo = l.num;
      if (s.loans.some((o) => o.req === l.req && !o.back && !o.holder))
        s.pending = l.req;
      commit(
        l.asset + " returned by " + by + ". Slip L-" + l.num + " closed.",
      );
      return;
    }
    if (f.matches("[data-followup]")) {
      const holder = String(form.get("holder"));
      const expected = String(form.get("expected"));
      const r = getReq(s.pending);
      const left = s.loans.filter(
        (l) => l.req === s.pending && !l.back && !l.holder,
      );
      if (!r || !left.length || !people.includes(holder) || !dueAt[expected])
        return;
      for (const l of left) Object.assign(l, { holder, expected });
      s.notes.push({
        phase: s.phase,
        auto: true,
        text:
          r.club +
          " (" +
          r.id +
          ") came back partly. Still out: " +
          left.map((l) => unitName(l.asset) + " on slip L-" + l.num).join(", ") +
          ", now with " +
          holder +
          ", expected " +
          expected +
          ".",
      });
      s.pending = "";
      commit("Saved on the slip and in the desk book.");
      return;
    }
    if (!f.matches("[data-issue]")) return;
    const [req, asset, who, due] = ["req", "asset", "who", "due"].map((k) =>
      form.get(k),
    );
    const unit = getAsset(asset),
      r = getReq(req);
    if (!r || !unit || unit.repair || out(asset) || !people.includes(who))
      return;
    if (!r.items.includes(unit.type)) {
      q("[data-status]").textContent =
        "This equipment type is outside the approved request. Choose an approved unit.";
      return;
    }
    if (
      s.loans.some(
        (l) => l.req === req && !l.back && getAsset(l.asset).type === unit.type,
      )
    ) {
      q("[data-status]").textContent =
        "The approved quantity of this equipment type is already on loan.";
      return;
    }
    const num = Math.max(...s.loans.map((l) => l.num)) + 1;
    s.loans.push({ num, req, asset, who, due, back: false });
    s.editing = false;
    commit("Issued " + asset + " to " + who + " on slip L-" + num + ".");
  });
  function restore(d) {
    if (
      !d ||
      d.version !== 2 ||
      !Object.hasOwn(screens, d.tab) ||
      !shifts[d.phase] ||
      (d.selected && !getReq(d.selected)) ||
      !Array.isArray(d.notes) ||
      !d.notes.every(
        (n) => n && shifts[n.phase] && typeof n.text === "string",
      ) ||
      !Array.isArray(d.loans) ||
      !d.loans.length ||
      !d.loans.every(
        (l) =>
          l && getReq(l.req) && getAsset(l.asset) && Number.isInteger(l.num),
      )
    )
      return;
    s = {
      ...original(),
      ...d,
      loans: d.loans.map((l) => ({ ...l })),
      notes: d.notes.map((n) => ({ ...n })),
    };
    paint();
  }
  paint();
  try {
    restore(JSON.parse(localStorage.getItem(storageKey)));
  } catch {
    // Keep the fresh shift when storage is unavailable or the saved data is invalid.
  }
})();
