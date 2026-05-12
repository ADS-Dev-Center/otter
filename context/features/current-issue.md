## fix audit log

i got some error :
GET /auditlog 200 in 196ms (next.js: 7ms, proxy.ts: 9ms, application-code: 180ms)
[browser] Uncaught PrismaClientValidationError:
Invalid `__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].auditLog.findMany()` invocation in
/Users/adsemesta09/gawe/otter/.next/dev/server/chunks/ssr/[root-of-the-server]\__06aoxgi._.js:460:138

457 const divisionIds = await (0, **TURBOPACK**imported**module**$5b$project$5d2f$lib$2f$auth$2e$ts**$5b$app$2d$rsc$5d$**$28$ecmascript$29$**["getUserDivisionIds"])(userId);
458 const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
459 const [entries, total, divisions] = await Promise.all([
→ 460 **TURBOPACK**imported**module**$5b$project$5d2f$lib$2f$prisma$2e$ts**$5b$app$2d$rsc$5d$**$28$ecmascript$29$**["prisma"].auditLog.findMany({
where: {
divisionId: {
in: [
"cmoxs9wvj000dlx9ke0tsh02m",
"cmoxsa0kr000flx9k5nw4uz79",
"cmoxsa3xk000hlx9kr47sr5c9",
"cmoxssoev000jlx9ku2q9p1mk"
]
},
timestamp: {
gte: new Date("2026-04-09T03:42:27.150Z")
}
},
include: {
division: {

```
select: {
name: true
}
},
? credential?: true
},
orderBy: {
timestamp: "desc"
},
take: 15
})

Unknown field `division` for include statement on model `AuditLog`. Available options are marked with ?.
at <unknown> (app/(app)/auditlog/page.tsx:22:21)
at AuditLogLoader (app/(app)/auditlog/page.tsx:21:39)
20 |
21 | const [entries, total, divisions] = await Promise.all([

> 22 | prisma.auditLog.findMany({

     |                     ^

23 | where: {
24 | divisionId: { in: divisionIds },
25 | timestamp: { gte: since },



```
