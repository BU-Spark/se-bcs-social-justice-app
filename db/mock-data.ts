export const communities = [
  {
    name: "Black Women in Academia",
    description:
      "Connect with other professionals on navigating being a WOC in academic spaces.",
    imageUrl: "https://i.postimg.cc/Kv7VQGHs/bwia.png",
    type: "Affinity Group",
  },
  {
    name: "Be The Messenger",
    description:
      "Conversation on the Be the Messenger Framework established by Dr. Chad Starks.",
    imageUrl: "https://i.postimg.cc/YqBZ1GbW/btm.png",
    type: "Book Club",
  },
  {
    name: "Encouraging Black Youth",
    description:
      "Learn how to empower Black youth to embrace their potential and shape a future of limitless possibilities.",
    imageUrl: "https://i.postimg.cc/264Fm6vs/image-4.png",
    type: "K-12",
  },
  {
    name: "Courageous Hearts",
    description:
      "Courageous Hearts integrates self-reflection, social justice, and personal empowerment.",
    imageUrl:
      "https://media-hosting.imagekit.io//6a8d11890fce436b/ch.png?Expires=1837332054&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=mEpDoVjDF8~A4QhzA5HKNHXsCE6iPa~pIRBEQtLYTC0-kAhul1jSCBOhZXEuuYFdQwr10-9igxRPCSHo0DIL0uCyPfkkDzWsfBZE6mVOrgb9iwSZK1anywCqdHOSUoZ~INidZMiXIz6cxeoKvNZ3-xPMIqi6UwUQD71gp2sMIqIcJUp~AhqWeODAd5XXQgvo2qZBs6hGC231qsj9wo0b-~S8SihA1JShG1mi0vFYqnJSVQgrgZxz5QbsERyU0WQer~plcbxXYWXpxdS-Ox9sNgGGqHbftj9aYK8sZ~Lgtl2FazXAzJB9cNEZU7aMIebN1sol34G9WmJIhc-GkgJQFg__",
    type: "N/A",
  },
  {
    name: "Healthcare Justice",
    description:
      "Create a healthcare system that serves everyone fairly and compassionately.",
    imageUrl:
      "https://media-hosting.imagekit.io//5beaa53cd5434945/hj.png?Expires=1837332054&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=gdiV0Fott~RoEYL1ADqqhR7uhDRM7cH1naBPqgowi9Cv5cCO00ua6rLC2THwxegorRi67AHsO1acEi68yt0KlOLRPyJzwYsxeVK1XA-apOfWCQ-54hKajSbZBOdBQPSElJLTCGF8SmgqCXMpxvFpcZ14c5csl310YKhamLhktitrigrbqanm6X6ZU7Q5~hitgj687JChb~WJhoyBekdbX2OEYxkfqOX~iV8IkeIfb3eA7M0NAdlYCRv559zTxI1I~SsrlQsYJKrwZeLXcKNGjqfnokj8o2JxbR2f83cxiC3XfvkNEDZDO2Bc6Nh58Q19zXgptCaN3FJiBvWDIMFq3w__",
    type: "N/A",
  },
  {
    name: "Boston Grassroots",
    description:
      "Fostering a sense of belonging through collective community action.",
    imageUrl:
      "https://media-hosting.imagekit.io//3d91312ec1704eae/bg.png?Expires=1837332054&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=uXHbbhVJCIsI92OY7Zafx5qSgm1HRIX--Cv5rqVMtYovYBaS6G67blNUdC-n9Z0kwYvbaw1ot6GRrT546lotatnmyv-5RMJxfzOSmlT1iK6d5xfnvrZnqpeEgyR5YnbQT-OoA7vgcTdfbgy1jEWAn155oM7KhrsAUVU7Gpdak8kRSn5la0Ym8U~Do0Rfi4aL5FG7suBsUk7B5dDP~EFZNkWcuji5pWM-lw1tsFN-34Zgz3u~bY17eWy3mU41frda9ve9-bxuZe0tk85Ryp7uoBcoct2Nw4R0Iob9h2AU1BdjvpT3vvSh51TJCuHHr7-C5pJ-RCVIDh5leiW8aWmYrQ__",
    type: "N/A",
  },
];

export const postings = [
  {
    title: "Welcome to the Community Blog",
    content:
      "We are excited to have you here! Share your ideas, engage with others, and help our community grow.",
    score: 5,
  },
  {
    title: "Upcoming Meetup Announcement",
    content:
      "Don't miss our upcoming meetup next month! We are planning discussions, networking opportunities, and fun activities. Stay tuned.",
    score: 3,
  },
  {
    title: "Community Guidelines",
    content:
      "Please take a moment to review the community guidelines to ensure a respectful and enjoyable environment for everyone.",
    score: 2,
  },
  ...Array.from({ length: 100 }, (_, i) => ({
    title: `Post # ${i + 1}`,
    content: `This is a placeholder content for post number ${i + 1}`,
    score: Math.floor(Math.random() * 5) + 1,
  })),
];
