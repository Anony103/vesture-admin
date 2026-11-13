/**
 * Look for the pop-ups built with MUI's Modal: the box takes the theme's surface and text colours (so it is right in dark and light),
 * stays inside a phone screen, and scrolls if its content is taller than the window.
 * Use: <Modal ... slotProps={modalSlotProps}><Box sx={modalSx(400)}>...</Box></Modal>
 */
export const modalSx = (width = 400) =>
  ({
    position: "absolute" as const,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width,
    maxWidth: "calc(100vw - 32px)",
    maxHeight: "90vh",
    overflowY: "auto" as const,
    bgcolor: "var(--surface)",
    color: "var(--fg)",
    border: "1px solid var(--line-hi)",
    borderRadius: "1.25rem",
    boxShadow: "0 30px 80px -20px rgba(0, 0, 0, 0.6)",
    p: 3,
    outline: "none",
  });

/** A dimmed, slightly blurred layer behind the box. */
export const modalSlotProps = {
  backdrop: { sx: { backgroundColor: "rgba(6, 3, 14, 0.72)", backdropFilter: "blur(4px)" } },
};
