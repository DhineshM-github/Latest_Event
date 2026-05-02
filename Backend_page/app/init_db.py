from app.database import get_db_connection

def create_tables():

    db = get_db_connection(None)
    cursor = db.cursor(buffered=True)
    cursor.execute("CREATE DATABASE IF NOT EXISTS event_db")

    cursor.close()
    db.close()
    # 🔹 Step 2: Connect to event_db
    db = get_db_connection()
    cursor = db.cursor(buffered=True)

    users_table = """
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(100) UNIQUE,
        password VARCHAR(255),
        role ENUM('organizer', 'exhibitor', 'superuser')
    )
    """

    event_details_table = """
    CREATE TABLE IF NOT EXISTS event_details_table (
        id INT AUTO_INCREMENT PRIMARY KEY,

        event_code VARCHAR(50),

        category VARCHAR(100),
        event_name VARCHAR(255),
        description TEXT,
        amenities TEXT,
        tags TEXT,

        visibility VARCHAR(50),
        include_program VARCHAR(10),

        mail BOOLEAN DEFAULT FALSE,
        whatsapp BOOLEAN DEFAULT FALSE,
        print BOOLEAN DEFAULT FALSE,

        visitor_mail BOOLEAN DEFAULT FALSE,
        visitor_name BOOLEAN DEFAULT FALSE,
        visitor_photo BOOLEAN DEFAULT FALSE,
        visitor_mobile BOOLEAN DEFAULT FALSE,
        document_proof BOOLEAN DEFAULT FALSE,

        day_pass BOOLEAN DEFAULT FALSE,
        is_international_include BOOLEAN DEFAULT FALSE,

        aadhar BOOLEAN DEFAULT FALSE,
        passport BOOLEAN DEFAULT FALSE,

        welcome_kit BOOLEAN DEFAULT FALSE,
        food BOOLEAN DEFAULT FALSE,

        event_type VARCHAR(50),
        occurrence VARCHAR(50),

        start_date DATE,
        start_time TIME,
        end_date DATE,
        end_time TIME,

        venue VARCHAR(255),
        address TEXT,
        user_id INT,
        status ENUM('PENDING','APPROVED','REJECTED') ,
        approved_at DATETIME,
        rejected_at DATETIME,
        created_by VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """

    event_booking_table="""CREATE TABLE IF NOT EXISTS event_booking_details (
    id INT AUTO_INCREMENT PRIMARY KEY,

    event_id INT,

    booking_start_date DATE,
    booking_end_date DATE,

    capacity INT,
    pass_type VARCHAR(50),

    title VARCHAR(100),
    title_type VARCHAR(50),
    title_selection TEXT,

    designation VARCHAR(100),
    designation_type VARCHAR(50),
    designation_selection TEXT,

    company VARCHAR(100),
    company_type VARCHAR(50),
    company_selection TEXT,

    entry_type VARCHAR(50),

    charge_type VARCHAR(50),
    max_pass INT,

    razorpay_key TEXT,

    include_tax BOOLEAN,

    price_type VARCHAR(50),
    currency VARCHAR(50),

    early_bird_expire DATETIME,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (event_id) REFERENCES event_details_table(id) ON DELETE CASCADE
);"""

    food_live_count = """
    CREATE TABLE IF NOT EXISTS food_live_count (
        id INT AUTO_INCREMENT PRIMARY KEY,

        event_id INT,
        meal_time VARCHAR(50),
        meal_type VARCHAR(50),

        guests_inside INT DEFAULT 0,
        total_capacity INT DEFAULT 0,
        waiting_outside INT DEFAULT 0,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """
    countries_table = """
    CREATE TABLE IF NOT EXISTS countries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        country_name VARCHAR(100)
    )
    """

    states_table = """
    CREATE TABLE IF NOT EXISTS states (
        id INT AUTO_INCREMENT PRIMARY KEY,
        state_name VARCHAR(100),
        country_id INT,
        FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE CASCADE
    )
    """

    cities_table = """
    CREATE TABLE IF NOT EXISTS cities (
        id INT AUTO_INCREMENT PRIMARY KEY,
        city_name VARCHAR(100),
        state_id INT,
        FOREIGN KEY (state_id) REFERENCES states(id) ON DELETE CASCADE
    )
    """

    venues_table = """
    CREATE TABLE IF NOT EXISTS venues (
        id INT AUTO_INCREMENT PRIMARY KEY,
        venue_code VARCHAR(20),
        venue_name VARCHAR(200),
        address TEXT,
        country_name  VARCHAR(30),
        state_name  VARCHAR(30),
        city_name  VARCHAR(30),
        venue_image LONGTEXT,
        status VARCHAR(20)
    )
    """

    sponsor_detail="""
    CREATE TABLE IF NOT EXISTS sponsors_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sponsor_code VARCHAR(50),
    sponsor_name VARCHAR(150),
    primary_contact VARCHAR(20),
    secondary_contact VARCHAR(20),
    mail_id VARCHAR(150),
    address TEXT,
    status VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
    """
    Sponsor_Document="""
    CREATE TABLE IF NOT EXISTS sponsor_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sponsor_id INT,
    document_type VARCHAR(50),
    document_number VARCHAR(100),
    document_file LONGTEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);"""

    documents_table = """
    CREATE TABLE IF NOT EXISTS venue_documents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        venue_id INT,
        document_type VARCHAR(100),
        document_number VARCHAR(100),
        document_file LONGTEXT
    )
    """
    vendor_details="""
    CREATE TABLE IF NOT EXISTS vendor_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vendor_type VARCHAR(50),
    vendor_name VARCHAR(150),
    company_name VARCHAR(150),
    primary_contact VARCHAR(20),
    secondary_contact VARCHAR(20),
    mail_id VARCHAR(150),
    address TEXT,
    bank_name VARCHAR(150),
    account_holder VARCHAR(150),
    ifsc_code VARCHAR(50),
    account_number VARCHAR(50),
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
    """
    Vendor_Document="""
    CREATE TABLE IF NOT EXISTS vendor_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vendor_id INT,
    document_type VARCHAR(50),
    document_number VARCHAR(100),
    document_file LONGTEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES vendor_details(id) ON DELETE CASCADE
);
    """
    policy_table="""CREATE TABLE IF NOT EXISTS  policies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    policy_code VARCHAR(50),
    policy_name VARCHAR(255),
    policy_type VARCHAR(50),
    policy_group VARCHAR(100),
    description TEXT,
    organizer_id INT,
    status VARCHAR(20) DEFAULT 'Active'
);"""

    event_layout="""
  CREATE TABLE IF NOT EXISTS event_layout (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT,

    floor_type VARCHAR(50),
    day_based BOOLEAN,
    person_pass INT,
    include_tax BOOLEAN,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES event_details_table(id) ON DELETE CASCADE
);
    """

    event_stalls="""CREATE TABLE IF NOT EXISTS event_stalls (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT,

    stall_name VARCHAR(255),
    stall_size VARCHAR(50),
    size_range VARCHAR(100),
    visibility VARCHAR(50),
    stall_type VARCHAR(50),

    price_inr VARCHAR(50),
    price_usd VARCHAR(50),

    prime_seat BOOLEAN,
    prime_price_inr VARCHAR(50),
    prime_price_usd VARCHAR(50),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES event_details_table(id) ON DELETE CASCADE
);"""
    stall_amenities="""
    CREATE TABLE IF NOT EXISTS stall_amenities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT,

    stall_name VARCHAR(255),
    amenity VARCHAR(255),
    qty INT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES event_details_table(id) ON DELETE CASCADE
);
    """
    event_document="""
    CREATE TABLE IF NOT EXISTS event_files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT,
    file_name VARCHAR(255),
    file_path TEXT,
    file_type VARCHAR(50), -- banner / document / video
    doc_type VARCHAR(100),
    doc_number VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id)
    REFERENCES event_details_table(id)
    ON DELETE CASCADE
    
);
"""
    event_Terms="""
    CREATE TABLE IF NOT EXISTS event_terms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    policy_group VARCHAR(100),
    policy_type VARCHAR(100),
    policy_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_event_terms_event
    FOREIGN KEY (event_id)
    REFERENCES event_details_table(id)
    ON DELETE CASCADE
);
    """
    event_vendor="""
    CREATE TABLE IF NOT EXISTS event_vendors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT,
    vendor_type VARCHAR(100),
    vendor_name VARCHAR(150),
    pass_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id)
    REFERENCES event_details_table(id)
    ON DELETE CASCADE
);
    """
    event_sponsors="""
    CREATE TABLE IF NOT EXISTS event_sponsors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT,
    sponsor_name VARCHAR(150),
    sponsorship_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id)
    REFERENCES event_details_table(id)
    ON DELETE CASCADE
);
    """
    event_guest="""CREATE TABLE IF NOT EXISTS event_guests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT,
    guest_name VARCHAR(150),
    designation VARCHAR(150),
    contact VARCHAR(20),
    image LONGTEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id)
    REFERENCES event_details_table(id)
    ON DELETE CASCADE
);"""
    user_booking_details="""CREATE TABLE  IF NOT EXISTS user_booking_details (
    id INT AUTO_INCREMENT PRIMARY KEY,

    event_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(15),
    food_preference VARCHAR(50) DEFAULT 'None',
    qr_data TEXT,
    is_scanned BOOLEAN DEFAULT FALSE,
    scanned_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES event_details_table(id) ON DELETE CASCADE
);"""
    feedback_table="""CREATE TABLE IF NOT EXISTS feedback_event (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    feedback_code VARCHAR(50),
    event_id      INT NOT NULL,
    event_name    VARCHAR(255) NOT NULL,
    explanation   TEXT,
    status        VARCHAR(20)  DEFAULT 'Active',
    created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    modified_on   DATE         DEFAULT NULL,
    FOREIGN KEY (event_id) REFERENCES event_details_table(id) ON DELETE CASCADE
);"""

    def alter_booking_details_table(cursor):
        try:
            columns_to_add = [
                ("food_preference", "VARCHAR(50) DEFAULT 'None'"),
                ("qr_data", "TEXT"),
                ("is_scanned", "BOOLEAN DEFAULT FALSE"),
                ("scanned_at", "DATETIME")
            ]
            
            for col_name, col_type in columns_to_add:
                cursor.execute(f"SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'user_booking_details' AND COLUMN_NAME = %s AND TABLE_SCHEMA = DATABASE()", (col_name,))
                if not cursor.fetchone():
                    cursor.execute(f"ALTER TABLE user_booking_details ADD COLUMN {col_name} {col_type};")
                    print(f"Added {col_name} to user_booking_details")
        except Exception as e:
            print("Alter booking error:", str(e))

    stall_booking="""
    CREATE TABLE  IF NOT EXISTS Exhibitor_stall_bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT,
    user_id INT,

    title VARCHAR(10),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(150),
    mobile VARCHAR(20),
    eventName VARCHAR(100),

    designation VARCHAR(150),
    company_name VARCHAR(150),

    country VARCHAR(100),
    state VARCHAR(100),
    city VARCHAR(100),
    address TEXT,
    messages TEXT,
    pin_code VARCHAR(20),
    stall_area VARCHAR(50),
    products VARCHAR(100),

    visiting_card VARCHAR(255),

    status VARCHAR(50) DEFAULT 'pending',  -- ✅ here

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (event_id) REFERENCES event_details_table(id) ON DELETE CASCADE
);
    """
    todo_tasks_table = """
        CREATE TABLE IF NOT EXISTS todo_tasks (
            id INT AUTO_INCREMENT PRIMARY KEY,
            task_name VARCHAR(255) NOT NULL,
            task_description TEXT,
            todo_list_name VARCHAR(255),
            start_date DATE,
            end_date DATE,
            assigned_to VARCHAR(100),
            status VARCHAR(50) DEFAULT 'In-Progress',
            complete_percent INT DEFAULT 0,
            remarks TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
"""
    messages_table="""
        CREATE TABLE IF NOT EXISTS messages_greetings_table (
            id              INT AUTO_INCREMENT PRIMARY KEY,
            event_id        INT           NOT NULL,
            type            VARCHAR(20)   NOT NULL DEFAULT 'Messages',
            message_group   VARCHAR(255)  NOT NULL,
            topics          VARCHAR(255)  DEFAULT NULL,
            sub_topics      VARCHAR(255)  DEFAULT NULL,
            description     LONGTEXT      DEFAULT NULL,
            image_path      LONGTEXT      DEFAULT NULL,

            created_at      DATETIME      DEFAULT CURRENT_TIMESTAMP,
            updated_at      DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            CONSTRAINT fk_mg_event
                FOREIGN KEY (event_id)
                REFERENCES event_details_table(id)
                ON DELETE CASCADE
        );
        """
    my_contacts_table = """
    CREATE TABLE IF NOT EXISTS my_contacts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255),
        mobile VARCHAR(20),
        user_type VARCHAR(100),
        group_name VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """

    def alter_policies_table(cursor):
        try:
            # Check column exists
            cursor.execute("""
                SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = 'policies' 
                AND COLUMN_NAME = 'file_path'
                AND TABLE_SCHEMA = DATABASE()
            """)
            column = cursor.fetchone()

            if not column:
                cursor.execute("ALTER TABLE policies ADD COLUMN file_path TEXT;")
                print("file_path column added to policies table")
            else:
                print("file_path already exists")

        except Exception as e:
            print("Alter error:", str(e))

    def alter_event_table_user_id(cursor):
        try:
            cursor.execute("""
                SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = 'event_details_table' 
                AND COLUMN_NAME = 'user_id'
                AND TABLE_SCHEMA = DATABASE()
            """)
            column = cursor.fetchone()

            if not column:
                cursor.execute("ALTER TABLE event_details_table ADD COLUMN user_id INT;")
                print("user_id column added to event_details_table table")
            else:
                print("user_id already exists")

        except Exception as e:
            print("Alter event error:", str(e))

    

    def alter_users_table(cursor):
        try:
            columns_to_add = [
                ("mobile", "VARCHAR(20)"),
                ("address", "TEXT"),
                ("country", "VARCHAR(100)"),
                ("state", "VARCHAR(100)"),
                ("city", "VARCHAR(100)"),
                ("profile_image", "LONGTEXT")

            ]
            for col_name, col_type in columns_to_add:
                cursor.execute("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = %s AND TABLE_SCHEMA = DATABASE()", (col_name,))
                if not cursor.fetchone():
                    cursor.execute(f"ALTER TABLE users ADD COLUMN {col_name} {col_type};")
                    print(f"Added {col_name} to users table")
        except Exception as e:
            print("Alter users error:", str(e))
    # 1. First create base tables (No foreign keys or referenced by others)
    cursor.execute(users_table)
    alter_users_table(cursor)
    print("Users table checked")

    cursor.execute(event_details_table)
    alter_event_table_user_id(cursor)
    print("Event details table checked")

    cursor.execute(countries_table)
    cursor.execute(states_table)
    cursor.execute(cities_table)
    print("Location tables checked")

    # 2. Create tables that reference event_details_table or others
    cursor.execute(event_booking_table)
    cursor.execute(event_layout)
    cursor.execute(event_stalls)
    cursor.execute(stall_amenities)
    cursor.execute(event_document)
    cursor.execute(event_Terms)
    cursor.execute(event_guest)
    cursor.execute(event_sponsors)
    cursor.execute(event_vendor)
    cursor.execute(user_booking_details)
    cursor.execute(stall_booking)
    cursor.execute(food_live_count)
    cursor.execute(messages_table)
    cursor.execute(feedback_table)
    cursor.execute(todo_tasks_table)
    
    # 3. Create remaining independent or specific tables
    cursor.execute(venues_table)
    cursor.execute(documents_table)
    cursor.execute(my_contacts_table)
    cursor.execute(sponsor_detail)
    cursor.execute(Sponsor_Document)
    cursor.execute(vendor_details)
    cursor.execute(Vendor_Document)
    cursor.execute(policy_table)
    
    alter_policies_table(cursor)
    alter_booking_details_table(cursor)
    
    print("All tables checked / created successfully")

    complaint_table = """
    CREATE TABLE IF NOT EXISTS complaint (
        id INT AUTO_INCREMENT PRIMARY KEY,
        complaint_code VARCHAR(20) UNIQUE,
        event_id INT,
        event_name VARCHAR(255),
        infrastructure_rating INT DEFAULT 0,
        amenities_rating INT DEFAULT 0,
        overall_experience_rating INT DEFAULT 0,
        venue_locations_rating INT DEFAULT 0,
        transportation_rating INT DEFAULT 0,
        convenience_rating INT DEFAULT 0,
        explanation TEXT,
        status VARCHAR(20) DEFAULT 'Active',
        created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES event_details_table(id) ON DELETE SET NULL
    )
    """
    cursor.execute(complaint_table)
    
    event_programs_table = """
    CREATE TABLE IF NOT EXISTS event_programs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        event_id INT,
        program_name VARCHAR(255),
        program_code VARCHAR(50),
        category VARCHAR(100),
        type VARCHAR(100),
        start_date DATETIME,
        end_date DATETIME,
        venue VARCHAR(255),
        max_participants INT DEFAULT 0,
        budget DECIMAL(10, 2) DEFAULT 0.0,
        coordinator_name VARCHAR(150),
        coordinator_email VARCHAR(150),
        description TEXT,
        status VARCHAR(50) DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES event_details_table(id) ON DELETE CASCADE
    );
    """
    cursor.execute(event_programs_table)
    cursor.execute("CREATE TABLE IF NOT EXISTS chat_history (id INT AUTO_INCREMENT PRIMARY KEY, user_id VARCHAR(100), message TEXT, response TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)")
    cursor.execute("CREATE TABLE IF NOT EXISTS faq (id INT AUTO_INCREMENT PRIMARY KEY, question TEXT, answer TEXT, category VARCHAR(100), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)")

    # -------------------------------
    # CHECK IF DATA EXISTS
    # -------------------------------
    cursor.execute("SELECT id FROM countries WHERE country_name=%s", ("India",))
    existing = cursor.fetchone()

    if existing:
        print("Data already exists")

    else:
        # -------------------------------
        # 1. Insert Country
        # -------------------------------
        cursor.execute(
            "INSERT INTO countries (country_name) VALUES (%s)",
            ("India",)
        )

        country_id = cursor.lastrowid

        # -------------------------------
        # 2. Insert States
        # -------------------------------
        states = [
            'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
            'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
            'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
            'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
            'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
            'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
        ]

        state_ids = {}

        for state in states:
            cursor.execute(
                "INSERT INTO states (state_name, country_id) VALUES (%s, %s)",
                (state, country_id)
            )
            state_ids[state] = cursor.lastrowid

        # -------------------------------
        # 3. Insert Cities (Tamil Nadu)
        # -------------------------------
        tamil_nadu_id = state_ids["Tamil Nadu"]

        cities = [
            'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore',
            'Dharmapuri', 'Dindigul', 'Erode', 'Kallakurichi', 'Kanchipuram',
            'Kanyakumari', 'Karur', 'Krishnagiri', 'Madurai', 'Mayiladuthurai',
            'Nagapattinam', 'Namakkal', 'Nilgiris', 'Perambalur', 'Pudukkottai',
            'Ramanathapuram', 'Ranipet', 'Salem', 'Sivaganga', 'Tenkasi',
            'Thanjavur', 'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli',
            'Tirupathur', 'Tiruppur', 'Tiruvallur', 'Tiruvannamalai',
            'Tiruvarur', 'Vellore', 'Viluppuram', 'Virudhunagar'
        ]

        for city in cities:
            cursor.execute(
                "INSERT INTO cities (city_name, state_id) VALUES (%s, %s)",
                (city, tamil_nadu_id)
            )

        print("Seed data inserted")

    # -------------------------------
    # FINAL COMMIT & CLOSE
    # -------------------------------
    db.commit()
    cursor.close()
    db.close()

    print("Tables checked / created successfully")
