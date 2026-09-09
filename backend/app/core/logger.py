import sys
import logging
import json
from contextvars import ContextVar
from datetime import datetime

# Context variables for tracing logs across async tasks and pipeline threads
current_job_id: ContextVar[str] = ContextVar("current_job_id", default="SYSTEM")
current_stage_name: ContextVar[str] = ContextVar("current_stage_name", default="CORE")

class StructuredJsonFormatter(logging.Formatter):
    """Structured JSON formatter for production air-gapped diagnostics."""
    def format(self, record: logging.LogRecord) -> str:
        job_id = getattr(record, "job_id", current_job_id.get())
        stage_name = getattr(record, "stage_name", current_stage_name.get())
        
        log_entry = {
            "timestamp": datetime.fromtimestamp(record.created).isoformat() + "Z",
            "level": record.levelname,
            "job_id": job_id,
            "stage": stage_name,
            "module": record.module,
            "message": record.getMessage()
        }
        if record.exc_info:
            log_entry["exception"] = self.formatException(record.exc_info)
        return json.dumps(log_entry)

class ColoredConsoleFormatter(logging.Formatter):
    """Readable colored log formatter for local dev & edge kernel stream."""
    CYAN = "\033[36m"
    GREEN = "\033[32m"
    YELLOW = "\033[33m"
    RED = "\033[31m"
    MAGENTA = "\033[35m"
    BOLD = "\033[1m"
    RESET = "\033[0m"

    LEVEL_COLORS = {
        "DEBUG": "\033[37m",
        "INFO": GREEN,
        "WARNING": YELLOW,
        "ERROR": RED,
        "CRITICAL": BOLD + RED
    }

    def format(self, record: logging.LogRecord) -> str:
        job_id = getattr(record, "job_id", current_job_id.get())
        stage = getattr(record, "stage_name", current_stage_name.get())
        now_str = datetime.fromtimestamp(record.created).strftime("%H:%M:%S.%f")[:-3]
        color = self.LEVEL_COLORS.get(record.levelname, self.RESET)

        prefix = f"{self.CYAN}[{now_str}]{self.RESET} {color}[{record.levelname:<7}]{self.RESET}"
        context = f"{self.MAGENTA}[{job_id}|{stage}]{self.RESET}"
        return f"{prefix} {context} {record.getMessage()}"

def setup_logger(name: str = "terravision") -> logging.Logger:
    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)
    
    if not logger.handlers:
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setFormatter(ColoredConsoleFormatter())
        logger.addHandler(console_handler)
        
    return logger

logger = setup_logger()
