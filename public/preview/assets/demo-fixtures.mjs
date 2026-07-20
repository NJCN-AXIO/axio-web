export const DEMO_FIXTURES = {
  stores: [
    {
      id: "demo-store-a",
      alias: "演示店铺 A",
      name: "演示店铺 A",
      group: "G1",
      site: "MY",
      category: "家居生活",
      grade: "A",
      current_products: 128,
      total_capacity: 300,
      capacity_gap: 172,
      published_today: 4,
      daily_remaining: 46,
      max_executable: 46,
      saturation: 42.7,
      capacity_warnings: [],
      publish_eligible: true,
      publish_block_reasons: [],
      status: "active",
    },
  ],
  tasks: [
    {
      task_id: "DEMO-TASK-000",
      input: {
        keywords: "桌面收纳用品",
        quantity: 6,
        sites: ["MY"],
        group: "G1",
      },
      status: "completed",
      live_status: { status: "completed", progress: "模拟任务已完成" },
      created_at: "2026-07-20 19:30",
      updated_at: "2026-07-20 19:32",
    },
  ],
};
