export function DashboardMockup() {
  const bookings = [
    {
      id: "RV-2401",
      vehicle: "Porsche 911 GT3",
      service: "Full Service",
      status: "In Progress",
      time: "09:00",
    },
    {
      id: "RV-2402",
      vehicle: "McLaren 720S",
      service: "Brake Overhaul",
      status: "Awaiting",
      time: "11:30",
    },
    {
      id: "RV-2403",
      vehicle: "Ferrari F8",
      service: "Diagnostics",
      status: "Complete",
      time: "14:00",
    },
    {
      id: "RV-2404",
      vehicle: "Lamborghini Huracán",
      service: "Suspension",
      status: "In Progress",
      time: "15:30",
    },
  ];

  const statusStyle = (status: string) => {
    if (status === "Complete")
      return {
        background: "rgba(34,197,94,0.12)",
        color: "#4ade80",
        border: "1px solid rgba(34,197,94,0.2)",
      };
    if (status === "In Progress")
      return {
        background: "rgba(82,44,20,0.3)",
        color: "#fb923c",
        border: "1px solid rgba(107,56,24,0.4)",
      };
    return {
      background: "rgba(161,161,170,0.1)",
      color: "#A1A1AA",
      border: "1px solid rgba(161,161,170,0.15)",
    };
  };

  return (
    <div
      className="relative rounded-2xl overflow-hidden"
      style={{
        background: "#111111",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow:
          "0 40px 120px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)",
      }}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{
          background: "#0E0E0E",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <div className="flex gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: "#3a3a3a" }}
            />
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: "#3a3a3a" }}
            />
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: "#3a3a3a" }}
            />
          </div>
        </div>
        <div
          className="px-4 py-1 rounded-full text-xs"
          style={{
            background: "rgba(255,255,255,0.04)",
            color: "#A1A1AA",
            fontFamily: "'Satoshi', sans-serif",
            fontSize: "0.7rem",
          }}
        >
          app.revion.io/dashboard
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: "#4ade80" }}
          />
          <span
            style={{
              fontFamily: "'Satoshi', sans-serif",
              fontSize: "0.7rem",
              color: "#4ade80",
            }}
          >
            Live
          </span>
        </div>
      </div>

      <div className="p-5 flex flex-col gap-4">
        {/* Stat cards row */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Active Jobs", value: "12", sub: "+3 today", trend: "up" },
            {
              label: "Completed",
              value: "847",
              sub: "This month",
              trend: "up",
            },
            { label: "Revenue", value: "£94.2K", sub: "+18.4%", trend: "up" },
            {
              label: "Avg. Time",
              value: "2.4h",
              sub: "Per vehicle",
              trend: "neutral",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl p-4"
              style={{
                background: "#181818",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div
                style={{
                  fontFamily: "'Satoshi', sans-serif",
                  fontSize: "0.65rem",
                  color: "#A1A1AA",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: "6px",
                }}
              >
                {stat.label}
              </div>
              <div
                style={{
                  fontFamily: "'Satoshi', sans-serif",
                  fontSize: "1.35rem",
                  fontWeight: 700,
                  color: "#F5F5F5",
                  lineHeight: 1,
                  marginBottom: "4px",
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontFamily: "'Satoshi', sans-serif",
                  fontSize: "0.65rem",
                  color: stat.trend === "up" ? "#4ade80" : "#A1A1AA",
                }}
              >
                {stat.sub}
              </div>
            </div>
          ))}
        </div>

        {/* Main content row */}
        <div className="grid grid-cols-3 gap-3">
          {/* Bookings table */}
          <div
            className="col-span-2 rounded-xl overflow-hidden"
            style={{
              background: "#181818",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
            >
              <span
                style={{
                  fontFamily: "'Satoshi', sans-serif",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "#F5F5F5",
                }}
              >
                Today`s Schedule
              </span>
              <span
                className="px-2 py-0.5 rounded-full"
                style={{
                  background: "rgba(82,44,20,0.25)",
                  color: "#fb923c",
                  fontFamily: "'Satoshi', sans-serif",
                  fontSize: "0.6rem",
                  fontWeight: 600,
                }}
              >
                4 Active
              </span>
            </div>
            <div
              className="divide-y"
              style={{ borderColor: "rgba(255,255,255,0.03)" }}
            >
              {bookings.map((b) => (
                <div key={b.id} className="flex items-center gap-3 px-4 py-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: "rgba(255,255,255,0.04)" }}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <rect
                        x="1"
                        y="5"
                        width="12"
                        height="6"
                        rx="2"
                        stroke="#A1A1AA"
                        strokeWidth="1.2"
                      />
                      <path
                        d="M3 5V4a4 4 0 018 0v1"
                        stroke="#A1A1AA"
                        strokeWidth="1.2"
                      />
                      <circle cx="4" cy="11" r="1" fill="#A1A1AA" />
                      <circle cx="10" cy="11" r="1" fill="#A1A1AA" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      style={{
                        fontFamily: "'Satoshi', sans-serif",
                        fontSize: "0.72rem",
                        fontWeight: 600,
                        color: "#F5F5F5",
                        marginBottom: "2px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {b.vehicle}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Satoshi', sans-serif",
                        fontSize: "0.6rem",
                        color: "#A1A1AA",
                      }}
                    >
                      {b.service}
                    </div>
                  </div>
                  <div
                    className="text-center shrink-0"
                    style={{
                      fontFamily: "'Satoshi', sans-serif",
                      fontSize: "0.65rem",
                      color: "#A1A1AA",
                      minWidth: "36px",
                    }}
                  >
                    {b.time}
                  </div>
                  <div
                    className="px-2 py-0.5 rounded-full shrink-0"
                    style={{
                      ...statusStyle(b.status),
                      fontFamily: "'Satoshi', sans-serif",
                      fontSize: "0.58rem",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {b.status}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Vehicle tracking card */}
          <div
            className="rounded-xl p-4 flex flex-col gap-3"
            style={{
              background: "#181818",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div
              style={{
                fontFamily: "'Satoshi', sans-serif",
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "#F5F5F5",
              }}
            >
              Service Bay Status
            </div>
            {[
              {
                bay: "Bay 01",
                vehicle: "Porsche GT3",
                progress: 68,
                active: true,
              },
              {
                bay: "Bay 02",
                vehicle: "McLaren 720S",
                progress: 22,
                active: true,
              },
              {
                bay: "Bay 03",
                vehicle: "Ferrari F8",
                progress: 100,
                active: false,
              },
            ].map((bay) => (
              <div key={bay.bay} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <div>
                    <div
                      style={{
                        fontFamily: "'Satoshi', sans-serif",
                        fontSize: "0.65rem",
                        fontWeight: 600,
                        color: "#F5F5F5",
                      }}
                    >
                      {bay.bay}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Satoshi', sans-serif",
                        fontSize: "0.58rem",
                        color: "#A1A1AA",
                      }}
                    >
                      {bay.vehicle}
                    </div>
                  </div>
                  <span
                    style={{
                      fontFamily: "'Satoshi', sans-serif",
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      color: bay.progress === 100 ? "#4ade80" : "#fb923c",
                    }}
                  >
                    {bay.progress}%
                  </span>
                </div>
                <div
                  className="h-1 rounded-full overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${bay.progress}%`,
                      background:
                        bay.progress === 100
                          ? "#4ade80"
                          : "linear-gradient(90deg, #522C14, #e07b35)",
                    }}
                  />
                </div>
              </div>
            ))}

            {/* Mini chart */}
            <div
              className="mt-auto rounded-lg p-3"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.04)",
              }}
            >
              <div
                style={{
                  fontFamily: "'Satoshi', sans-serif",
                  fontSize: "0.6rem",
                  color: "#A1A1AA",
                  marginBottom: "8px",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Weekly Jobs
              </div>
              <div className="flex items-end gap-1 h-10">
                {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm"
                    style={{
                      height: `${h}%`,
                      background:
                        i === 5
                          ? "linear-gradient(180deg, #e07b35, #522C14)"
                          : "rgba(255,255,255,0.08)",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
