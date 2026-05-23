import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import MessageBoard from "@/components/pages/messageBoard/MessageBoard";
import { useUser } from "@clerk/nextjs";
import { MessageboardQueryResult } from "@/types/sanity.types";

// Setup mocks
vi.mock("@/sanity/lib/utils", () => {
  const imageBuilder = {
    width: () => imageBuilder,
    height: () => imageBuilder,
    fit: () => imageBuilder,
    url: () => "https://test.sanity.io/images/test-image.jpg",
  };
  return {
    urlForImage: () => imageBuilder,
  };
});

vi.mock("@clerk/nextjs", () => ({
  useUser: vi.fn(),
}));

describe("Message Board Component", () => {
  const mockMessages = [
    {
      _id: "1",
      _createdAt: "2025-08-24T12:00:00Z",
      _updatedAt: "2025-08-24T12:00:00Z",
      title: "Test Message 1",
      bodyText: [
        {
          _type: "block",
          _key: "block1",
          children: [{ _type: "span", _key: "span1", text: "Test body 1" }],
          markDefs: [],
          style: "normal",
        },
      ],
      messageImage: null,
      fromAdmin: true,
      comments: [],
      author: {
        _id: "clerk|user1", // Match the Clerk user ID format
        firstName: "John",
        lastName: "Doe",
      },
      tags: [],
    },
    {
      _id: "2",
      _createdAt: "2025-08-24T12:00:00Z",
      _updatedAt: "2025-08-24T12:00:00Z",
      title: "Test Message 2",
      bodyText: [
        {
          _type: "block",
          _key: "block2",
          children: [{ _type: "span", _key: "span2", text: "Test body 2" }],
          markDefs: [],
          style: "normal",
        },
      ],
      messageImage: null,
      fromAdmin: false,
      comments: [
        {
          _key: "comment1",
          commentText: "Test comment 1",
          commentTitle: "Comment 1",
          commentAuthor: {
            _id: "user3",
            firstName: "Comment",
            lastName: "Author",
          },
        },
      ],
      author: {
        _id: "user2",
        firstName: "Jane",
        lastName: "Smith",
      },
      tags: [],
    },
  ] as unknown as MessageboardQueryResult;

  const mockUser = {
    id: "clerk|user1", // Match the author._id format
    firstName: "John",
    lastName: "Doe",
    publicMetadata: {
      roles: ["admin"],
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useUser as any).mockReturnValue({ user: mockUser, isLoaded: true });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders the message board with messages", () => {
    render(<MessageBoard messages={mockMessages} messageCount={mockMessages.length} />);

    expect(screen.getByText("Oppslagstavle")).toBeInTheDocument();
    expect(screen.getByText("Test Message 1")).toBeInTheDocument();
    expect(screen.getByText("Test Message 2")).toBeInTheDocument();
  });

  it("shows admin footer message for admin users", () => {
    render(<MessageBoard messages={mockMessages} messageCount={mockMessages.length} />);

    expect(
      screen.getByText("Du publiserer som: John Doe eller styret"),
    ).toBeInTheDocument();
  });

  it("handles empty message list", () => {
    render(<MessageBoard messages={[]} messageCount={0} />);

    expect(
      screen.getByText(
        "Det er ingen innlegg ennå. Kanskje du vil opprette det første?",
      ),
    ).toBeInTheDocument();
  });

  it("shows correct author for admin messages", () => {
    render(<MessageBoard messages={mockMessages} messageCount={mockMessages.length} />);

    // Admin message should show "Styret" as author
    expect(screen.getByText("Styret")).toBeInTheDocument();
  });

  it("renders non-admin user correctly", () => {
    (useUser as any).mockReturnValue({
      user: { ...mockUser, publicMetadata: { roles: [] } },
      isLoaded: true,
    });

    render(<MessageBoard messages={mockMessages} messageCount={mockMessages.length} />);

    // Should not show admin footer message
    expect(screen.queryByText(/Du publiserer som:/)).not.toBeInTheDocument();
  });

  it("handles both filter conditions together", () => {
    render(<MessageBoard messages={mockMessages} messageCount={mockMessages.length} />);

    // Select admin messages
    const checkbox = screen.getByLabelText("Kun innlegg fra styret");
    fireEvent.click(checkbox);

    // Select my messages
    const myMessagesButton = screen.getByText(/Se mine innlegg/);
    fireEvent.click(myMessagesButton);

    // Should show admin message from user1 only
    expect(screen.getByText("Test Message 1")).toBeInTheDocument();
    expect(screen.queryByText("Test Message 2")).not.toBeInTheDocument();
  });

  it("renders message comments correctly", () => {
    render(<MessageBoard messages={mockMessages} messageCount={mockMessages.length} />);

    // Message 2 has one comment
    const commentCount = screen.getAllByText("1");
    expect(commentCount.length).toBeGreaterThan(0);
  });

  it("handles messages with no image", () => {
    render(<MessageBoard messages={mockMessages} messageCount={mockMessages.length} />);

    // Messages render even without images
    expect(screen.getByText("Test Message 1")).toBeInTheDocument();
    expect(screen.getByText("Test Message 2")).toBeInTheDocument();
  });

  it("renders correctly when not loaded", () => {
    (useUser as any).mockReturnValue({
      user: null,
      isLoaded: false,
    });

    render(<MessageBoard messages={mockMessages} messageCount={mockMessages.length} />);

    // Components should still render without user data
    expect(screen.getByText("Test Message 1")).toBeInTheDocument();
    expect(screen.getByText("Test Message 2")).toBeInTheDocument();
  });
});
