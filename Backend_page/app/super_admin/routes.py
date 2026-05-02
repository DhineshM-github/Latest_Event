from flask import Blueprint, jsonify,request
#from app.middleware.role_required import role_required
import json
import os
from werkzeug.utils import secure_filename
from datetime import datetime
from app.init_db import get_db_connection
from mysql.connector import Error
from datetime import date
super_admin_bp = Blueprint("super_admin", __name__)

#@role_required("super_admin")

@super_admin_bp.route("/api/events_detail", methods=["GET"])
def events():

    db = get_db_connection()
    cursor = db.cursor()

    try:

        cursor.execute("""
            SELECT id, event_code, event_name 
            FROM event_details_table
        """)

        rows = cursor.fetchall()
        print("Event",rows)

        events = []

        for row in rows:
            events.append({
                "id": row[0],
                "event_code": row[1],
                "event_name": row[2]
            })

        return jsonify({
            "status": "success",
            "data": events
        })

    except Exception as e:

        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

    finally:
        cursor.close()
        db.close()

@super_admin_bp.route("/api/live_food_count", methods=["POST"])
def get_live_food_count():

    db = get_db_connection()
    cursor = db.cursor()

    try:

        data = request.json

        event_id = data.get("event_id")
        meal_time = data.get("meal_time")
        meal_type = data.get("meal_type")

        cursor.execute("""
            SELECT guests_inside, total_capacity, waiting_outside
            FROM food_live_count
            WHERE event_id=%s AND meal_time=%s AND meal_type=%s
        """,(event_id, meal_time, meal_type))

        row = cursor.fetchone()
        print("Food",row)

        if row:

            result = {
                "guests_inside": row[0],
                "total_capacity": row[1],
                "waiting_outside": row[2]
            }

        else:

            result = {
                "guests_inside": 0,
                "total_capacity": 0,
                "waiting_outside": 0
            }

        return jsonify({
            "status": "success",
            "data": result
        })

    except Exception as e:

        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

    finally:
        cursor.close()
        db.close()

# -----------------------------------
# GET COUNTRIES
# -----------------------------------

@super_admin_bp.route("/api/countries", methods=["GET"])
def get_countries():

    try:

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT * FROM countries")

        data = cursor.fetchall()

        return jsonify(data)

    except Exception as e:

        return jsonify({"error": str(e)})

    finally:

        cursor.close()
        conn.close()


# -----------------------------------
# GET STATES
# -----------------------------------

@super_admin_bp.route("/api/states/<country_id>", methods=["GET"])
def get_states(country_id):

    try:

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            "SELECT * FROM states WHERE country_id=%s",
            (country_id,)
        )

        data = cursor.fetchall()

        return jsonify(data)

    except Exception as e:

        return jsonify({"error": str(e)})

    finally:

        cursor.close()
        conn.close()


# -----------------------------------
# GET CITIES
# -----------------------------------

@super_admin_bp.route("/api/cities/<state_id>", methods=["GET"])
def get_cities(state_id):

    try:

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            "SELECT * FROM cities WHERE state_id=%s",
            (state_id,)
        )

        data = cursor.fetchall()

        return jsonify(data)

    except Exception as e:

        return jsonify({"error": str(e)})

    finally:

        cursor.close()
        conn.close()


# -----------------------------------
# CREATE VENUE
# -----------------------------------
@super_admin_bp.route("/api/create_venue", methods=["POST"])
def create_venue():

    try:

        data = request.json
        print("Create", data)

        venue_name = data.get("venue_name")
        address = data.get("address")
        country_id = data.get("country")
        state_id = data.get("state")
        city_id = data.get("city")
        status = data.get("status")
        venue_image = data.get("venue_image")

        documents = data.get("documents")

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # get country name
        cursor.execute(
            "SELECT country_name FROM countries WHERE id=%s",
            (country_id,)
        )
        country = cursor.fetchone()["country_name"]

        # get state name
        cursor.execute(
            "SELECT state_name FROM states WHERE id=%s",
            (state_id,)
        )
        state = cursor.fetchone()["state_name"]

        # get city name
        cursor.execute(
            "SELECT city_name FROM cities WHERE id=%s",
            (city_id,)
        )
        city = cursor.fetchone()["city_name"]

        # generate venue code
        cursor.execute("SELECT MAX(id) as max_id FROM venues")
        result = cursor.fetchone()

        new_number = (result["max_id"] or 0) + 1
        venue_code = f"VEN-{new_number}"

        # insert venue
        cursor.execute(
            """
            INSERT INTO venues
            (venue_code,venue_name,address,country_name,state_name,city_name,venue_image,status)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
            """,
            (
                venue_code,
                venue_name,
                address,
                country,
                state,
                city,
                venue_image,
                status
            )
        )

        venue_id = cursor.lastrowid

        # insert documents
        if documents:

            for doc in documents:

                cursor.execute(
                    """
                    INSERT INTO venue_documents
                    (venue_id,document_type,document_number,document_file)
                    VALUES (%s,%s,%s,%s)
                    """,
                    (
                        venue_id,
                        doc["document_type"],
                        doc["document_number"],
                        doc["document_file"]
                    )
                )

        conn.commit()

        return jsonify({
            "message": "Venue Created",
            "venue_code": venue_code
        })

    except Exception as e:

        return jsonify({
            "error": str(e)
        })

    finally:

        cursor.close()
        conn.close()


# -----------------------------------
# GET VENUE LIST
# -----------------------------------

@super_admin_bp.route("/api/venues", methods=["GET"])
def get_venues():

    try:

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            "SELECT id,venue_code,venue_name,address,status FROM venues"
        )

        data = cursor.fetchall()
        print(data)

        return jsonify(data)

    except Exception as e:

        return jsonify({"error": str(e)})

    finally:

        cursor.close()
        conn.close()

@super_admin_bp.route("/api/delete_venue/<int:id>", methods=["DELETE"])
def delete_venue(id):
    try:
        print("Venue",id)
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # ✅ Check if venue exists
        cursor.execute("SELECT * FROM venues WHERE id = %s", (id,))
        venue = cursor.fetchone()

        if not venue:
            return jsonify({
                "status": False,
                "message": "Venue not found"
            }), 404

        # ✅ Delete venue
        cursor.execute("DELETE FROM venues WHERE id = %s", (id,))
        conn.commit()

        return jsonify({
            "status": True,
            "message": "Venue deleted successfully"
        }), 200

    except Exception as e:
        print("ERROR:", str(e))
        return jsonify({
            "status": False,
            "message": "Failed to delete venue",
            "error": str(e)
        }), 500

    finally:
        cursor.close()
        conn.close()
# -----------------------------------
# VIEW VENUE DETAILS
# -----------------------------------

@super_admin_bp.route("/api/venuedetail/<id>", methods=["GET"])
def venue_details(id):

    try:

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            "SELECT * FROM venues WHERE id=%s",
            (id,)
        )

        venue = cursor.fetchone()

        cursor.execute(
            "SELECT * FROM venue_documents WHERE venue_id=%s",
            (id,)
        )

        docs = cursor.fetchall()

        return jsonify({
            "venue": venue,
            "documents": docs
        })

    except Exception as e:

        return jsonify({"error": str(e)})

    finally:

        cursor.close()
        conn.close()


@super_admin_bp.route("/api/create_sponsor", methods=["POST"])
def create_sponsor_detail():

    conn = None
    cursor = None

    try:

        data = request.json
        print("Data:", data)

        sponsor_name = data["sponsor_name"]
        primary_contact = data["primary_contact"]
        secondary_contact = data.get("secondary_contact")
        mail_id = data["mail_id"]
        address = data["address"]
        status = data.get("status", "Active")

        conn = get_db_connection()
        cursor = conn.cursor()

        # Generate sponsor code
        cursor.execute("SELECT COUNT(*) FROM sponsors_details")
        count = cursor.fetchone()[0] + 1

        sponsor_code = f"SP{str(count).zfill(4)}"

        cursor.execute(
            """
            INSERT INTO sponsors_details
            (sponsor_code, sponsor_name, primary_contact, secondary_contact, mail_id, address, status)
            VALUES (%s,%s,%s,%s,%s,%s,%s)
            """,
            (
                sponsor_code,
                sponsor_name,
                primary_contact,
                secondary_contact,
                mail_id,
                address,
                status
            )
        )

        conn.commit()

        return jsonify({
            "status": "success",
            "message": "Sponsor created successfully"
        }), 201

    except Exception as e:

        print("ERROR:", str(e))

        if conn:
            conn.rollback()

        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

    finally:

        if cursor:
            cursor.close()

        if conn:
            conn.close()

@super_admin_bp.route("/api/sponsors", methods=["GET"])
def get_sponsors():

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM sponsors_details ORDER BY id DESC")

    sponsors = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(sponsors)

@super_admin_bp.route("/api/sponsor/<int:id>", methods=["GET"])
def view_sponsor(id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM sponsors_details WHERE id=%s", (id,))
    sponsor = cursor.fetchone()
    cursor.close()
    conn.close()
    return jsonify(sponsor)
@super_admin_bp.route("/api/delete_sponsor/<int:id>", methods=["DELETE"])
def delete_sponsor(id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Check if sponsor exists
        cursor.execute("SELECT * FROM sponsors_details WHERE id = %s", (id,))
        sponsor = cursor.fetchone()

        if not sponsor:
            return jsonify({
                "status": False,
                "message": "Sponsor not found"
            }), 404

        # Delete sponsor
        cursor.execute("DELETE FROM sponsors_details WHERE id = %s", (id,))
        conn.commit()

        return jsonify({
            "status": True,
            "message": "Sponsor deleted successfully"
        }), 200

    except Exception as e:
        print("ERROR:", str(e))
        return jsonify({
            "status": False,
            "message": "Failed to delete sponsor",
            "error": str(e)
        }), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@super_admin_bp.route("/api/create_vendor", methods=["POST"])
def create_vendor():

    conn = None
    cursor = None

    try:

        data = request.json
        print("Data",data)

        vendor_type = data["vendor_type"]
        vendor_name = data["vendor_name"]
        company_name = data["company_name"]
        primary_contact = data["primary_contact"]
        secondary_contact = data.get("secondary_contact")
        mail_id = data["mail_id"]
        address = data["address"]

        bank_name = data.get("bank_name")
        account_holder = data.get("account_holder")
        ifsc_code = data.get("ifsc_code")
        account_number = data.get("account_number")

        status = data.get("status", "Active")

        documents = data.get("documents", [])

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
        INSERT INTO vendor_details
        (vendor_type,vendor_name,company_name,primary_contact,secondary_contact,mail_id,address,
        bank_name,account_holder,ifsc_code,account_number,status)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """,(
            vendor_type,
            vendor_name,
            company_name,
            primary_contact,
            secondary_contact,
            mail_id,
            address,
            bank_name,
            account_holder,
            ifsc_code,
            account_number,
            status
        ))

        vendor_id = cursor.lastrowid

        # Insert Documents

        for doc in documents:

            cursor.execute("""
            INSERT INTO vendor_documents
            (vendor_id,document_type,document_number,document_file)
            VALUES (%s,%s,%s,%s)
            """,(
                vendor_id,
                doc["document_type"],
                doc["document_number"],
                doc["document_file"]
            ))

        conn.commit()

        return jsonify({
            "status":"success",
            "message":"Vendor created successfully"
        })

    except Exception as e:

        if conn:
            conn.rollback()

        return jsonify({
            "status":"error",
            "message":str(e)
        }),500

    finally:

        if cursor:
            cursor.close()

        if conn:
            conn.close()

@super_admin_bp.route("/api/vendors", methods=["GET"])
def get_vendors():

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
    SELECT id,vendor_name,primary_contact,mail_id,address,status
    FROM vendor_details
    ORDER BY id DESC
    """)

    vendors = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(vendors)
@super_admin_bp.route("/api/vendor/<int:id>", methods=["GET"])
def view_vendor(id):

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    print("Vendar",id)

    cursor.execute(
        "SELECT * FROM vendor_details WHERE id=%s",(id,)
    )

    vendor = cursor.fetchone()

    cursor.execute(
        "SELECT * FROM vendor_documents WHERE vendor_id=%s",(id,)
    )

    documents = cursor.fetchall()

    vendor["documents"] = documents
    print("Vendar",vendor)

    cursor.close()
    conn.close()

    return jsonify(vendor)

@super_admin_bp.route("/api/delete_vendor/<int:id>", methods=["DELETE"])
def delete_vendor(id):
    try:
        print("Delete Vendor", id)
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Check if vendor exists
        cursor.execute("SELECT * FROM vendor_details WHERE id = %s", (id,))
        vendor = cursor.fetchone()

        if not vendor:
            return jsonify({
                "status": False,
                "message": "Vendor not found"
            }), 404

        # Delete vendor documents
        cursor.execute("DELETE FROM vendor_documents WHERE vendor_id = %s", (id,))
        
        # Delete vendor
        cursor.execute("DELETE FROM vendor_details WHERE id = %s", (id,))
        conn.commit()

        return jsonify({
            "status": True,
            "message": "Vendor deleted successfully"
        }), 200

    except Exception as e:
        print("ERROR:", str(e))
        return jsonify({
            "status": False,
            "message": "Failed to delete vendor",
            "error": str(e)
        }), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@super_admin_bp.route("/api/venues_details", methods=["GET"])
def get_venues_detail():

    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    cursor.execute("SELECT id, venue_name, city_name FROM venues WHERE status='active'")
    venues = cursor.fetchall()

    cursor.close()
    db.close()

    return jsonify(venues)
@super_admin_bp.route("/api/create_policy", methods=["POST"])
def create_policy():
    try:
        data = request.json
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # ✅ Generate POLICY CODE (POL-1, POL-2...)
        cursor.execute("SELECT MAX(id) as max_id FROM policies")
        result = cursor.fetchone()

        new_number = (result["max_id"] or 0) + 1
        policy_code = f"POL-{new_number}"

        # ✅ INSERT
        cursor.execute("""
            INSERT INTO policies 
            (policy_code, policy_name, policy_type, policy_group, description,organizer_id ,status)
            VALUES (%s, %s, %s, %s, %s, %s,%s)
        """, (
            policy_code,
            data.get("policy_name"),
            data.get("policy_type"),
            data.get("policy_group"),
            data.get("description"),
            data.get("organizer_id"),
            data.get("status", "Active")
        ))

        conn.commit()

        return jsonify({
            "message": "Policy created successfully",
            "policy_code": policy_code
        }), 201

    except Exception as e:
        print("ERROR:", str(e))
        return jsonify({
            "error": "Failed to create policy",
            "details": str(e)
        }), 500

    finally:
        cursor.close()
        conn.close()

@super_admin_bp.route("/api/delete_policy/<int:id>", methods=["DELETE"])
def delete_policy(id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # ✅ Check if policy exists
        cursor.execute("SELECT * FROM policies WHERE id = %s", (id,))
        policy = cursor.fetchone()

        if not policy:
            return jsonify({
                "status": False,
                "message": "Policy not found"
            }), 404

        # ✅ Delete policy
        cursor.execute("DELETE FROM policies WHERE id = %s", (id,))
        conn.commit()

        return jsonify({
            "status": True,
            "message": "Policy deleted successfully"
        }), 200

    except Exception as e:
        print("ERROR:", str(e))
        return jsonify({
            "status": False,
            "message": "Failed to delete policy",
            "error": str(e)
        }), 500

    finally:
        cursor.close()
        conn.close()


# GET ALL
@super_admin_bp.route("/api/all-policies/<int:organizer_id>", methods=["GET"])
def get_policies(organizer_id):
    conn = None
    cursor = None

    try:
        print("Organizer",organizer_id)
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        query = "SELECT * FROM policies WHERE organizer_id = %s"
        cursor.execute(query, (organizer_id,))

        policies = cursor.fetchall()
        print(policies)

        return jsonify({
            "success": True,
            "data": policies
        }), 200

    except Exception as e:
        print("Error fetching policies:", str(e))
        return jsonify({
            "success": False,
            "message": "Failed to fetch policies"
        }), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


# GET SINGLE
@super_admin_bp.route("/api/policy/<int:id>", methods=["GET"])
def get_policy(id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM policies WHERE id=%s", (id,))
    return jsonify(cursor.fetchone())
import datetime as dt

def format_date(date_str):
    if not date_str:
        return None

    formats = [
        "%Y-%m-%d",   # 2026-03-17
        "%d/%m/%Y",   # 17/03/2026
        "%d-%m-%Y",   # 17-03-2026
    ]

    for fmt in formats:
        try:
            return dt.datetime.strptime(date_str, fmt).date()
        except:
            continue

    print("Date format error: Unsupported format ->", date_str)
    return None

def format_time(time_str):
    if not time_str:
        return None

    formats = [
        "%H:%M",        # 14:30
        "%I:%M %p",     # 02:30 PM
    ]

    for fmt in formats:
        try:
            return dt.datetime.strptime(time_str, fmt).time()
        except:
            continue

    print("Time format error: Unsupported format ->", time_str)
    return None

def format_datetime(dt_str):
    try:
        if dt_str:
            return datetime.strptime(dt_str, "%Y-%m-%dT%H:%M")
    except Exception as e:
        print("Datetime error:", e)
    return None




import os
from werkzeug.utils import secure_filename

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
BASE_UPLOAD = os.path.abspath(os.path.join(BASE_DIR, "..", "uploads"))

PHOTO_FOLDER = os.path.join(BASE_UPLOAD, "photos")
VIDEO_FOLDER = os.path.join(BASE_UPLOAD, "videos")
DOC_FOLDER = os.path.join(BASE_UPLOAD, "documents")

os.makedirs(PHOTO_FOLDER, exist_ok=True)
os.makedirs(VIDEO_FOLDER, exist_ok=True)
os.makedirs(DOC_FOLDER, exist_ok=True)

def get_file_folder(file):
    content_type = file.content_type

    if content_type.startswith("image"):
        return PHOTO_FOLDER, "photos", "image"

    elif content_type.startswith("video"):
        return VIDEO_FOLDER, "videos", "video"

    else:
        return DOC_FOLDER, "documents", "document"
# =====================================================
# ✅ COMPLETE TRANSACTIONAL EVENT CREATION
# =====================================================
@super_admin_bp.route("/api/complete-event", methods=["POST"])
def complete_event_creation():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Access data from form fields (sent as JSON strings)
        event_details = json.loads(request.form.get("eventDetails", "{}"))
        booking_details = json.loads(request.form.get("booking", "{}"))
        layout_details = json.loads(request.form.get("layout", "{}"))
        terms_data = json.loads(request.form.get("terms", "[]"))
        vendors_data = json.loads(request.form.get("vendors", "{}"))

        # 1. 🔹 INSERT EVENT DETAILS
        insert_event_query = """
        INSERT INTO event_details_table (
            category, event_name, description, amenities, tags,
            visibility, include_program,
            mail, whatsapp, print,
            visitor_mail, visitor_name, visitor_photo, visitor_mobile, document_proof,
            day_pass, is_international_include,
            aadhar, passport,
            welcome_kit, food,
            event_type, occurrence,
            start_date, start_time, end_date, end_time,
            venue, address, created_by, user_id, status
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        event_values = (
            event_details.get("category"),
            event_details.get("eventName"),
            event_details.get("description"),
            event_details.get("amenities", []),
            ",".join(event_details.get("tags", [])),
            event_details.get("visibility"),
            str(event_details.get("includeProgram", False)),
            event_details.get("mail", False),
            event_details.get("whatsapp", False),
            event_details.get("print", False),
            event_details.get("visitorMail", False),
            event_details.get("visitorName", False),
            event_details.get("visitorPhoto", False),
            event_details.get("visitorMobile", False),
            event_details.get("documentProof", False),
            event_details.get("dayPass", False),
            event_details.get("isInternationalInclude", False),
            event_details.get("aadhar", False),
            event_details.get("passport", False),
            event_details.get("welcomeKit", False),
            event_details.get("food", False),
            event_details.get("eventType"),
            event_details.get("occurrence"),
            format_date(event_details.get("startDate")),
            format_time(event_details.get("startTime")),
            format_date(event_details.get("endDate")),
            format_time(event_details.get("endTime")),
            event_details.get("venue"),
            event_details.get("address"),
            event_details.get("created_by"),
            event_details.get("user_id"),
            "PENDING" # Final state
        )
        cursor.execute(insert_event_query, event_values)
        event_id = cursor.lastrowid
        event_code = f"EVT-{str(event_id).zfill(4)}"
        cursor.execute("UPDATE event_details_table SET event_code=%s WHERE id=%s", (event_code, event_id))

        # 2. 🔹 INSERT BOOKING DETAILS
        insert_booking_query = """
        INSERT INTO event_booking_details (
            event_id, booking_start_date, booking_end_date, capacity, pass_type,
            title, title_type, title_selection, designation, designation_type, designation_selection,
            company, company_type, company_selection, entry_type, charge_type, max_pass,
            razorpay_key, include_tax, price_type, currency, early_bird_expire
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        booking_values = (
            event_id,
            format_date(booking_details.get("bookingStartDate")),
            format_date(booking_details.get("bookingEndDate")),
            booking_details.get("capacity"),
            booking_details.get("passType"),
            booking_details.get("title"), booking_details.get("titleType"), booking_details.get("titleSelection"),
            booking_details.get("designation"), booking_details.get("designationType"), booking_details.get("designationSelection"),
            booking_details.get("company"), booking_details.get("companyType"), booking_details.get("companySelection"),
            booking_details.get("entryType"),
            booking_details.get("chargeType"),
            booking_details.get("maxPass"),
            booking_details.get("razorpayKey"),
            booking_details.get("includeTax", False),
            booking_details.get("priceType"),
            booking_details.get("currency"),
            format_date(booking_details.get("earlyBirdExpire"))
        )
        cursor.execute(insert_booking_query, booking_values)

        # 3. 🔹 INSERT LAYOUT MASTER
        cursor.execute("""
            INSERT INTO event_layout (
                event_id, floor_type, day_based, person_pass, include_tax
            ) VALUES (%s, %s, %s, %s, %s)
        """, (
            event_id,
            layout_details.get("floorType"),
            layout_details.get("dayBased"),
            layout_details.get("personPass"),
            layout_details.get("includeTax")
        ))

        # 4. 🔹 INSERT STALLS
        stalls = layout_details.get("stalls", [])
        for stall in stalls:
            cursor.execute("""
                INSERT INTO event_stalls (
                    event_id, stall_name, stall_size, size_range, visibility,
                    stall_type, price_inr, price_usd, prime_seat, prime_price_inr, prime_price_usd
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                event_id,
                stall.get("stallName"),
                stall.get("size"),
                stall.get("sizeRange"),
                stall.get("visibility"),
                stall.get("type"),
                stall.get("priceINR"),
                stall.get("priceUSD"),
                stall.get("primeSeat"),
                stall.get("primePriceINR"),
                stall.get("primePriceUSD")
            ))

        # 5. 🔹 INSERT STALL AMENITIES
        amenities = layout_details.get("amenities", [])
        for a in amenities:
            cursor.execute("""
                INSERT INTO stall_amenities (
                    event_id, stall_name, amenity, qty
                ) VALUES (%s, %s, %s, %s)
            """, (
                event_id,
                a.get("stallName"),
                a.get("amenity"),
                a.get("qty")
            ))

        # 6. 🔹 HANDLE FILES (BANNER & DOCUMENTS)
        banner = request.files.get("banner")
        if banner:
            folder, relative_cat, _ = get_file_folder(banner)
            filename = secure_filename(banner.filename)
            save_path = os.path.join(folder, filename)
            db_path = f"/uploads/{relative_cat}/{filename}"
            banner.save(save_path)
            cursor.execute("INSERT INTO event_files (event_id, file_name, file_path, file_type) VALUES (%s, %s, %s, %s)", (event_id, filename, db_path, "banner"))

        doc_count = int(request.form.get("doc_count", 0))
        for i in range(doc_count):
            file = request.files.get(f"docs_{i}")
            if file:
                folder, relative_cat, file_category = get_file_folder(file)
                filename = secure_filename(file.filename)
                save_path = os.path.join(folder, filename)
                db_path = f"/uploads/{relative_cat}/{filename}"
                file.save(save_path)
                cursor.execute("""
                    INSERT INTO event_files (event_id, file_name, file_path, file_type, doc_type, doc_number)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, (event_id, filename, db_path, file_category, request.form.get(f"doc_type_{i}"), request.form.get(f"doc_number_{i}")))

        # 7. 🔹 INSERT TERMS
        for term in terms_data:
            cursor.execute("""
                INSERT INTO event_terms (event_id, policy_group, policy_type, policy_name)
                VALUES (%s, %s, %s, %s)
            """, (event_id, term.get("policyGroup"), term.get("policyType"), term.get("policyName")))

        # 8. 🔹 INSERT VENDORS, SPONSORS, GUESTS
        for v in vendors_data.get("vendors", []):
            cursor.execute("INSERT INTO event_vendors (event_id, vendor_type, vendor_name, pass_count) VALUES (%s, %s, %s, %s)", (event_id, v.get("vendorType"), v.get("vendorName"), v.get("passCount", 0)))
        for s in vendors_data.get("sponsors", []):
            cursor.execute("INSERT INTO event_sponsors (event_id, sponsor_name, sponsorship_type) VALUES (%s, %s, %s)", (event_id, s.get("sponsorName"), s.get("sponsorship")))
        for g in vendors_data.get("guests", []):
            cursor.execute("INSERT INTO event_guests (event_id, guest_name, designation, contact, image) VALUES (%s, %s, %s, %s, %s)", (event_id, g.get("name"), g.get("designation"), g.get("contact"), g.get("image")))

        conn.commit()
        return jsonify({"message": "Event created and submitted successfully", "event_id": event_id}), 201

    except Exception as e:
        conn.rollback()
        print("TRANSACTION ERROR:", str(e))
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()




@super_admin_bp.route("/api/all-policies", methods=["GET"])
def get_all_policies():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT policy_group, policy_type, policy_name
            FROM policies
            WHERE status='Active'
        """)

        rows = cursor.fetchall()

        cursor.close()
        conn.close()

        # 🔥 Convert to nested JSON
        data = {}

        for row in rows:
            group = row["policy_group"]
            type_ = row["policy_type"]
            name = row["policy_name"]

            if group not in data:
                data[group] = {}

            if type_ not in data[group]:
                data[group][type_] = []

            data[group][type_].append(name)

        return jsonify(data)

    except Exception as e:
        return jsonify({"error": str(e)}), 500
# ✅ Get Vendor Types
@super_admin_bp.route("/api/get-vendor-types", methods=["GET"])
def get_vendor_types():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT id,vendor_type FROM vendor_details")
    data = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(data)


# ✅ Get Vendor Names based on type
@super_admin_bp.route("/api/get-vendor-names/<vendor_type>", methods=["GET"])
def get_vendor_names(vendor_type):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        "SELECT vendor_name FROM vendor_details WHERE vendor_type=%s",
        (vendor_type,)
    )
    data = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(data)


# ✅ Get Sponsor Names
@super_admin_bp.route("/api/get-sponsor-names", methods=["GET"])
def get_sponsor_names():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT DISTINCT sponsor_name FROM sponsors_details")
    data = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(data)
# =========================
# SAVE VENDORS + SPONSORS + GUESTS
# =========================
@super_admin_bp.route("/api/save-vendors-sponsors", methods=["POST"])
def save_vendors():
    try:
        data = request.json
        event_id = data.get("event_id")

        vendors = data.get("vendors", [])
        sponsors = data.get("sponsors", [])
        guests = data.get("guests", [])

        conn = get_db_connection()
        cursor = conn.cursor()

        # =========================
        # CLEAR OLD DATA (IMPORTANT)
        # =========================
        cursor.execute("DELETE FROM event_vendors WHERE event_id=%s", (event_id,))
        cursor.execute("DELETE FROM event_sponsors WHERE event_id=%s", (event_id,))
        cursor.execute("DELETE FROM event_guests WHERE event_id=%s", (event_id,))

        # =========================
        # INSERT VENDORS
        # =========================
        for v in vendors:
            cursor.execute("""
                INSERT INTO event_vendors (event_id, vendor_type, vendor_name, pass_count)
                VALUES (%s, %s, %s, %s)
            """, (
                event_id,
                v.get("vendorType"),
                v.get("vendorName"),
                v.get("passCount", 0)
            ))

        # =========================
        # INSERT SPONSORS
        # =========================
        for s in sponsors:
            cursor.execute("""
                INSERT INTO event_sponsors (event_id, sponsor_name, sponsorship_type)
                VALUES (%s, %s, %s)
            """, (
                event_id,
                s.get("sponsorName"),
                s.get("sponsorship")
            ))

        # =========================
        # INSERT GUESTS
        # =========================
        for g in guests:
            cursor.execute("""
                INSERT INTO event_guests (event_id, guest_name, designation, contact, image)
                VALUES (%s, %s, %s, %s, %s)
            """, (
                event_id,
                g.get("name"),
                g.get("designation"),
                g.get("contact"),
                g.get("image")
            ))

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "Vendors, Sponsors, Guests saved successfully"}), 200

    except Exception as e:
        print("ERROR:", str(e))
        return jsonify({"error": str(e)}), 500

import datetime as dt

@super_admin_bp.route("/event/final-submit", methods=["POST"])
def final_submit():
    try:
        data = request.json
        event_id = data.get("event_id")

        print("DATA:", data)

        if not event_id:
            return jsonify({"error": "event_id is required"}), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            UPDATE event_details_table
            SET status = %s
            WHERE id = %s
        """, ("PENDING", event_id))

        conn.commit()

        cursor.close()
        conn.close()

        return jsonify({
            "message": "Event submitted successfully",
            "status": "PENDING",
            "event_id": event_id
        }), 200

    except Exception as e:
        print("FINAL SUBMIT ERROR:", str(e))
        return jsonify({"error": str(e)}), 500

from flask import send_from_directory
import datetime
# =====================================================
# ✅ ABSOLUTE UPLOAD FOLDER
# =====================================================
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
UPLOAD_FOLDER = os.path.abspath(os.path.join(BASE_DIR, "..", "uploads"))

# Example:
# D:/Project/app/super_admin → BASE_DIR
# D:/Project/app/uploads → UPLOAD_FOLDER


# =====================================================
# ✅ SERVE UPLOADED FILES (IMAGES / VIDEOS / DOCS)
# =====================================================
@super_admin_bp.route("/uploads/<path:filename>")
def serve_file(filename):
    try:
        return send_from_directory(UPLOAD_FOLDER, filename)
    except Exception as e:
        print("FILE ERROR:", e)
        return jsonify({"error": "File not found"}), 404

# =====================================================
# ✅ GET EVENTS WITH BANNER IMAGE
# =====================================================
@super_admin_bp.route("/get-events", methods=["GET"])
def get_events():
    try:
        organizer = request.args.get('organizer')
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        if organizer:
            query = """
            SELECT 
                e.id, e.status, e.event_name, e.category, e.description, e.amenities, e.tags,
                e.visibility, e.include_program, e.mail, e.whatsapp, e.print,
                e.visitor_mail, e.visitor_name, e.visitor_photo, e.visitor_mobile, e.document_proof,
                e.day_pass, e.is_international_include, e.aadhar, e.passport,
                e.welcome_kit, e.food, e.event_type, e.occurrence,
                e.start_date, e.start_time, e.end_date, e.end_time,
                e.venue, e.address, e.created_by,
                f.file_path, f.file_type AS banner_type,
                b.booking_start_date, b.booking_end_date, b.capacity, b.pass_type, b.entry_type, b.charge_type
            FROM event_details_table e
            LEFT JOIN event_files f 
                ON e.id = f.event_id AND f.file_type = 'banner'
            LEFT JOIN event_booking_details b
                ON e.id = b.event_id
            WHERE e.user_id = %s
            ORDER BY e.id DESC
            """
            cursor.execute(query, (organizer,))
        else:
            query = """
            SELECT 
                e.id, e.status, e.event_name, e.category, e.description, e.amenities, e.tags,
                e.visibility, e.include_program, e.mail, e.whatsapp, e.print,
                e.visitor_mail, e.visitor_name, e.visitor_photo, e.visitor_mobile, e.document_proof,
                e.day_pass, e.is_international_include, e.aadhar, e.passport,
                e.welcome_kit, e.food, e.event_type, e.occurrence,
                e.start_date, e.start_time, e.end_date, e.end_time,
                e.venue, e.address, e.created_by,
                f.file_path, f.file_type AS banner_type,
                b.booking_start_date, b.booking_end_date, b.capacity, b.pass_type, b.entry_type, b.charge_type
            FROM event_details_table e
            LEFT JOIN event_files f 
                ON e.id = f.event_id AND f.file_type = 'banner'
            LEFT JOIN event_booking_details b
                ON e.id = b.event_id
            ORDER BY e.id DESC
            """
            cursor.execute(query)
            
        data = cursor.fetchall()
        
        events_dict = {}

        for row in data:

            # =========================
            # ✅ DATE & TIME FIXES
            # =========================
            fields_to_fix = ["start_date", "end_date", "booking_start_date", "booking_end_date"]
            for f in fields_to_fix:
                if row.get(f):
                    row[f] = row[f].strftime("%Y-%m-%d")

            for tf in ["start_time", "end_time"]:
                if row.get(tf):
                    if isinstance(row[tf], datetime.timedelta):
                        total_seconds = int(row[tf].total_seconds())
                        hours = total_seconds // 3600
                        minutes = (total_seconds % 3600) // 60
                        row[tf] = f"{hours:02}:{minutes:02}"
                    else:
                        row[tf] = str(row[tf])

            # =========================
            # ✅ IMAGE PATH FIX (IMPORTANT)
            # =========================
            banner_url = None
            if row["file_path"]:
                file_path = row["file_path"].replace("\\", "/")
                
                if "/uploads/" in file_path:
                    relative_path = file_path.split("/uploads/")[-1]
                elif "uploads/" in file_path:
                    relative_path = file_path.split("uploads/")[-1]
                else:
                    relative_path = file_path

                base_url = request.host_url.rstrip("/")
                banner_url = f"{base_url}/superadmin/uploads/{relative_path.lstrip('/')}"
                
            event_id = row["id"]
            if event_id not in events_dict:
                row["banner_url"] = banner_url
                row["images"] = []
                if banner_url:
                    row["images"].append({"url": banner_url, "banner_type": row["banner_type"]})
                events_dict[event_id] = row
            else:
                if banner_url:
                    if not any(img["url"] == banner_url for img in events_dict[event_id]["images"]):
                        events_dict[event_id]["images"].append({"url": banner_url, "banner_type": row["banner_type"]})

        final_data = list(events_dict.values())

        cursor.close()
        conn.close()

        return jsonify(final_data), 200

    except Exception as e:
        print("ERROR:", e)
        return jsonify({"error": str(e)}), 500
from flask import request
@super_admin_bp.route("/home/get-events", methods=["GET"])
def get_home_events():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        query = """
        SELECT 
            e.id,
            e.status,
            e.event_name,
            e.category,
            e.start_date,
            e.start_time,
            e.venue,
            e.address,
            f.file_path,
            f.file_type AS banner_type,
            b.capacity,
            b.currency,
            b.entry_type
        FROM event_details_table e
        LEFT JOIN event_files f 
            ON e.id = f.event_id AND f.file_type = 'banner'
        LEFT JOIN event_booking_details b
            ON e.id = b.event_id
        WHERE e.status = 'APPROVED' 
        """
        #WHERE e.status = 'APPROVED' AND e.start_date >= CURDATE()

        cursor.execute(query)
        data = cursor.fetchall()

        events_dict = {}

        for row in data:

            # =========================
            # ✅ DATE FIX
            # =========================
            if row["start_date"]:
                row["start_date"] = row["start_date"].strftime("%Y-%m-%d")

            # =========================
            # ✅ TIME FIX
            # =========================
            if row["start_time"]:
                if isinstance(row["start_time"], datetime.timedelta):
                    total_seconds = int(row["start_time"].total_seconds())
                    hours = total_seconds // 3600
                    minutes = (total_seconds % 3600) // 60
                    row["start_time"] = f"{hours:02}:{minutes:02}"
                else:
                    row["start_time"] = str(row["start_time"])

            # =========================
            # ✅ IMAGE PATH FIX (IMPORTANT)
            # =========================
            banner_url = None
            if row["file_path"]:
                file_path = row["file_path"].replace("\\", "/")
                
                if "/uploads/" in file_path:
                    relative_path = file_path.split("/uploads/")[-1]
                elif "uploads/" in file_path:
                    relative_path = file_path.split("uploads/")[-1]
                else:
                    relative_path = file_path

                base_url = request.host_url.rstrip("/")
                banner_url = f"{base_url}/superadmin/uploads/{relative_path.lstrip('/')}"
                
            event_id = row["id"]
            if event_id not in events_dict:
                row["banner_url"] = banner_url
                row["images"] = []
                if banner_url:
                    row["images"].append({"url": banner_url, "banner_type": row["banner_type"]})
                events_dict[event_id] = row
            else:
                if banner_url:
                    if not any(img["url"] == banner_url for img in events_dict[event_id]["images"]):
                        events_dict[event_id]["images"].append({"url": banner_url, "banner_type": row["banner_type"]})

        final_data = list(events_dict.values())

        cursor.close()
        conn.close()

        return jsonify(final_data), 200

    except Exception as e:
        print("ERROR:", e)
        return jsonify({"error": str(e)}), 500


from datetime import timedelta

@super_admin_bp.route('/booking/event/<int:event_id>', methods=['GET'])
def get_event_booking(event_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM event_details_table WHERE id=%s", (event_id,))
    event = cursor.fetchone()

    if event:
        for key, value in event.items():
            if isinstance(value, timedelta):
                # Convert to HH:MM:SS format
                event[key] = str(value)

    return jsonify(event)

# ─── Get Full Event Details for Editing ───────────────────────────────────────
@super_admin_bp.route("/api/event-full-details/<int:event_id>", methods=["GET"])
def get_event_full_details(event_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # 1. Core Details
        cursor.execute("SELECT * FROM event_details_table WHERE id = %s", (event_id,))
        details = cursor.fetchone()
        if not details:
            return jsonify({"error": "Event not found"}), 404

        # Date/Time formatting
        for key, val in details.items():
            if isinstance(val, (date, datetime.datetime)):
                details[key] = val.strftime("%Y-%m-%d")
            elif isinstance(val, timedelta):
                total_seconds = int(val.total_seconds())
                hours = total_seconds // 3600
                minutes = (total_seconds % 3600) // 60
                details[key] = f"{hours:02}:{minutes:02}"

        # 2. Booking Details
        cursor.execute("SELECT * FROM event_booking_details WHERE event_id = %s", (event_id,))
        booking = cursor.fetchone()
        if booking:
            for key, val in booking.items():
                if isinstance(val, (date, datetime.datetime)):
                    booking[key] = val.strftime("%Y-%m-%d")

        # 3. Layout Details
        cursor.execute("SELECT * FROM event_layout WHERE event_id = %s", (event_id,))
        layout_master = cursor.fetchone()
        
        cursor.execute("SELECT * FROM event_stalls WHERE event_id = %s", (event_id,))
        stalls = cursor.fetchall()
        
        cursor.execute("SELECT * FROM stall_amenities WHERE event_id = %s", (event_id,))
        amenities = cursor.fetchall()

        # 4. Files
        cursor.execute("SELECT * FROM event_files WHERE event_id = %s", (event_id,))
        files = cursor.fetchall()
        
        for f in files:
            if f["file_path"]:
                base_url = request.host_url.rstrip("/")
                f["url"] = f"{base_url}/superadmin{f['file_path']}"

        # 5. Terms
        cursor.execute("SELECT * FROM event_terms WHERE event_id = %s", (event_id,))
        terms = cursor.fetchall()

        # 6. Vendors, Sponsors, Guests
        cursor.execute("SELECT * FROM event_vendors WHERE event_id = %s", (event_id,))
        vendors = cursor.fetchall()
        
        cursor.execute("SELECT * FROM event_sponsors WHERE event_id = %s", (event_id,))
        sponsors = cursor.fetchall()
        
        cursor.execute("SELECT * FROM event_guests WHERE event_id = %s", (event_id,))
        guests = cursor.fetchall()

        result = {
            "details": details,
            "booking": booking,
            "layout": {
                "master": layout_master,
                "stalls": stalls,
                "amenities": amenities
            },
            "files": files,
            "terms": terms,
            "vendor_data": {
                "vendors": vendors,
                "sponsors": sponsors,
                "guests": guests
            }
        }

        return jsonify(result)

    except Exception as e:
        print("GET FULL DETAILS ERROR:", str(e))
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@super_admin_bp.route('/api/admin/booking/<int:id>', methods=['GET'])
def get_single_booking(id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        query = """
            SELECT * FROM Exhibitor_stall_bookings
            WHERE id = %s
        """
        cursor.execute(query, (id,))
        booking = cursor.fetchone()

        if not booking:
            return jsonify({"message": "Booking not found"}), 404

        if booking.get("visiting_card"):
            base_url = request.host_url.rstrip("/")
            booking["visiting_card_url"] = f"{base_url}/superadmin/uploads/{os.path.basename(booking['visiting_card'])}"
        else:
            booking["visiting_card_url"] = None

        return jsonify(booking), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@super_admin_bp.route('/api/admin/bookings', methods=['GET'])
def get_all_bookings():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT * FROM Exhibitor_stall_bookings ORDER BY created_at DESC")
        bookings = cursor.fetchall()

        base_url = request.host_url.rstrip("/")
        for b in bookings:
            if b.get("visiting_card"):
                b["visiting_card_url"] = f"{base_url}/superadmin/uploads/{os.path.basename(b['visiting_card'])}"
            else:
                b["visiting_card_url"] = None

        return jsonify(bookings), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@super_admin_bp.route('/api/admin/update-booking-status/<int:id>', methods=['PUT'])
def update_booking_status(id):
    try:
        data = request.json
        status = data.get("status")

        conn = get_db_connection()
        cursor = conn.cursor()

        query = """
            UPDATE Exhibitor_stall_bookings
            SET status = %s
            WHERE id = %s
        """
        cursor.execute(query, (status, id))
        conn.commit()

        return jsonify({"message": "Status updated successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@super_admin_bp.route('/api/delete-event/<int:id>', methods=['DELETE'])
def delete_event(id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Check if event exists
        cursor.execute("SELECT id FROM event_details_table WHERE id = %s", (id,))
        if not cursor.fetchone():
            return jsonify({"status": False, "message": "Event not found"}), 404

        cursor.execute("DELETE FROM event_details_table WHERE id = %s", (id,))
        
        # Optionally we might want to delete from event_files, event_booking_details, etc., if cascading is not set up
        # but deleting from event_details_table is the primary action.
        cursor.execute("DELETE FROM event_booking_details WHERE event_id = %s", (id,))
        cursor.execute("DELETE FROM event_vendors WHERE event_id = %s", (id,))
        cursor.execute("DELETE FROM event_sponsors WHERE event_id = %s", (id,))
        cursor.execute("DELETE FROM event_guests WHERE event_id = %s", (id,))
        cursor.execute("DELETE FROM event_terms WHERE event_id = %s", (id,))
        cursor.execute("DELETE FROM event_files WHERE event_id = %s", (id,))
        cursor.execute("DELETE FROM event_layout WHERE event_id = %s", (id,))
        cursor.execute("DELETE FROM event_stalls WHERE event_id = %s", (id,))
        
        conn.commit()

        cursor.close()
        conn.close()

        return jsonify({"status": True, "message": "Event deleted successfully"}), 200

    except Exception as e:
        print("DELETE EVENT ERROR:", str(e))
        return jsonify({"status": False, "message": str(e)}), 500



 
# GET TASKS
@super_admin_bp.route('/api/get-tasks', methods=['GET'])
def get_tasks():
    try:
        conn = get_db_connection()   # ✅ FIXED
        cursor = conn.cursor(dictionary=True)
 
        cursor.execute("SELECT * FROM todo_tasks ORDER BY created_at DESC")
        tasks = cursor.fetchall()
 
        for task in tasks:
            if isinstance(task['start_date'], date):
                task['start_date'] = task['start_date'].strftime('%Y-%m-%d')
            if isinstance(task['end_date'], date):
                task['end_date'] = task['end_date'].strftime('%Y-%m-%d')
            if task.get('created_at'):
                task['created_at'] = str(task['created_at'])
 
        cursor.close()
        conn.close()
 
        return jsonify({'success': True, 'data': tasks})
 
    except Exception as e:
        print(f"Error in get_tasks: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

 
 
# CREATE TASK
@super_admin_bp.route('/api/create-tasks', methods=['POST'])
def create_tasks():
    try:
        data = request.get_json()
 
        task_name = data.get('task_name', '').strip()
        task_description = data.get('task_description', '').strip()
        todo_items = data.get('todo_items', [])
 
        if not task_name or not todo_items:
            return jsonify({'success': False, 'error': 'task_name and todo_items are required'}), 400
 
        conn = get_db_connection()   # ✅ FIXED
        cursor = conn.cursor()
 
        inserted = []
 
        for item in todo_items:
            cursor.execute("""
                INSERT INTO todo_tasks
                (task_name, task_description, todo_list_name, start_date, end_date,
                 assigned_to, status, complete_percent, remarks)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                task_name,
                task_description,
                item.get('todo_list_name'),
                item.get('start_date') or None,
                item.get('end_date') or None,
                item.get('assigned_to'),
                item.get('status', 'In-Progress'),
                int(item.get('complete_percent') or 0),
                item.get('remarks', '')
            ))
            inserted.append(cursor.lastrowid)

 
        conn.commit()
        cursor.close()
        conn.close()
 
        return jsonify({
            'success': True,
            'inserted_ids': inserted,
            'count': len(inserted)
        }), 201
 
    except Exception as e:
        print(f"Error in create_tasks: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500



@super_admin_bp.route("/api/add-on-spot-events", methods=["GET"])
def get_all_active_events():

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT 
                event_code,
                event_name,
                start_date,
                end_date
            FROM event_details_table
            WHERE status = 'APPROVED'
        """)

        data = cursor.fetchall()

        return jsonify(data)

    except Exception as e:
        return jsonify({"error": str(e)})

    finally:
        cursor.close()
        conn.close()

@super_admin_bp.route("/api/events-check-in", methods=["GET"])
def get_events_checkin():

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT 
                id,
                event_code,
                event_name,
                start_date,
                end_date
            FROM event_details_table
            WHERE status = 'APPROVED'
        """)

        data = cursor.fetchall()

        return jsonify(data)

    except Exception as e:
        return jsonify({"error": str(e)})

    finally:
        cursor.close()
        conn.close()

@super_admin_bp.route("/api/program-verification/events", methods=["GET"])
def get_program_verification_events():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT 
                id,
                event_code,
                event_name
            FROM event_details_table
            WHERE status = 'APPROVED'
            ORDER BY created_at DESC
        """)

        data = cursor.fetchall()

        return jsonify(data)

    except Exception as e:
        return jsonify({"error": str(e)})

    finally:
        cursor.close()
        conn.close()

# ─── Page 1: List all approved events ────────────────────────────────────────
@super_admin_bp.route("/api/message-greetings", methods=["GET"])
def get_all_message_greetings():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT
                id,
                event_name,
                start_date,
                end_date
            FROM event_details_table
            WHERE status = 'APPROVED'
            ORDER BY start_date DESC
        """)
        data = cursor.fetchall()
        # Serialize dates to strings
        for row in data:
            if isinstance(row.get("start_date"), date):
                row["start_date"] = row["start_date"].strftime("%d/%m/%Y")
            if isinstance(row.get("end_date"), date):
                row["end_date"] = row["end_date"].strftime("%d/%m/%Y")
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()
 
 
# ─── Page 2: Get messages for a specific event ────────────────────────────────
@super_admin_bp.route("/api/message-greetings/<int:event_id>/messages", methods=["GET"])
def get_messages_by_event(event_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT
                id,
                event_id,
                message_group,
                topics,
                sub_topics,
                description,
                image_path,
                type,
                created_at
            FROM messages_greetings_table
            WHERE event_id = %s
            ORDER BY created_at DESC
        """, (event_id,))
        data = cursor.fetchall()
        for row in data:
            if row.get("created_at"):
                row["created_at"] = row["created_at"].strftime("%d/%m/%Y %H:%M")
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()
 
 
# ─── Page 2: Save a new message ──────────────────────────────────────────────
@super_admin_bp.route("/api/message-greetings/<int:event_id>/messages", methods=["POST"])
def save_message(event_id):
    try:
        data = request.get_json()
        message_group = data.get("message_group")
        topics = data.get("topics", "")
        sub_topics = data.get("sub_topics", "")
        description = data.get("description", "")
        image_path = data.get("image_path", "")
        msg_type = data.get("type", "Messages")  # 'Messages' or 'Greetings'
 
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO messages_greetings_table
                (event_id, message_group, topics, sub_topics, description, image_path, type)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (event_id, message_group, topics, sub_topics, description, image_path, msg_type))
        conn.commit()
        new_id = cursor.lastrowid
        return jsonify({"success": True, "id": new_id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()
 
 
# ─── Page 2: Delete a message ────────────────────────────────────────────────
@super_admin_bp.route("/api/message-greetings/messages/<int:message_id>", methods=["DELETE"])
def delete_message(message_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM messages_greetings_table WHERE id = %s", (message_id,))
        conn.commit()
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# ─── Page 2: Update a message ────────────────────────────────────────────────
@super_admin_bp.route("/api/message-greetings/messages/<int:message_id>", methods=["PUT"])
def update_message(message_id):
    try:
        data = request.get_json()
        message_group = data.get("message_group")
        topics = data.get("topics", "")
        sub_topics = data.get("sub_topics", "")
        description = data.get("description", "")
        image_path = data.get("image_path", "")
        msg_type = data.get("type", "Messages")

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE messages_greetings_table
            SET message_group=%s, topics=%s, sub_topics=%s, description=%s, image_path=%s, type=%s
            WHERE id=%s
        """, (message_group, topics, sub_topics, description, image_path, msg_type, message_id))
        conn.commit()
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# ─── Update Event ────────────────────────────────────────────────────────────
@super_admin_bp.route("/api/update-event/<int:event_id>", methods=["PUT"])
def update_event(event_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        if 'eventDetails' in request.form:
             import json
             event_details = json.loads(request.form.get('eventDetails'))
             booking_details = json.loads(request.form.get('booking', '{}'))
             layout_details = json.loads(request.form.get('layout', '{}'))
             terms_data = json.loads(request.form.get('terms', '[]'))
             vendors_data = json.loads(request.form.get('vendors', '{}'))

             # 1. Update Core Details
             cursor.execute("""
                UPDATE event_details_table 
                SET event_name=%s, category=%s, description=%s, amenities=%s, tags=%s,
                    include_program=%s, visibility=%s, mail=%s, whatsapp=%s, print=%s,
                    visitor_mail=%s, visitor_name=%s, visitor_photo=%s, visitor_mobile=%s, document_proof=%s,
                    day_pass=%s, is_international_include=%s, aadhar=%s, passport=%s,
                    welcome_kit=%s, food=%s, event_type=%s, occurrence=%s,
                    start_date=%s, start_time=%s, end_date=%s, end_time=%s, venue=%s, address=%s
                WHERE id=%s
             """, (
                 event_details.get('eventName'),
                 event_details.get('category'),
                 event_details.get('description'),
                 event_details.get('amenities'),
                 event_details.get('tags'),
                 str(event_details.get('includeProgram')),
                 event_details.get('visibility'),
                 event_details.get('mail'), event_details.get('whatsapp'), event_details.get('print'),
                 event_details.get('visitorMail'), event_details.get('visitorName'), event_details.get('visitorPhoto'), event_details.get('visitorMobile'), event_details.get('documentProof'),
                 event_details.get('dayPass'), event_details.get('isInternationalInclude'), event_details.get('aadhar'), event_details.get('passport'),
                 event_details.get('welcomeKit'), event_details.get('food'),
                 event_details.get('eventType'), event_details.get('occurrence'),
                 event_details.get('startDate'), event_details.get('startTime'),
                 event_details.get('endDate'), event_details.get('endTime'),
                 event_details.get('venue'), event_details.get('address'),
                 event_id
             ))

             # 2. Update Booking
             if booking_details:
                 cursor.execute("""
                    UPDATE event_booking_details
                    SET booking_start_date=%s, booking_end_date=%s, capacity=%s, pass_type=%s, entry_type=%s, charge_type=%s
                    WHERE event_id=%s
                 """, (
                     booking_details.get('bookingStartDate'),
                     booking_details.get('bookingEndDate'),
                     booking_details.get('capacity'),
                     booking_details.get('passType'),
                     booking_details.get('entryType'),
                     booking_details.get('chargeType'),
                     event_id
                 ))

             # 3. Update Stalls (Delete and Re-insert)
             if 'stalls' in layout_details:
                 cursor.execute("DELETE FROM stall_amenities WHERE event_id = %s", (event_id,))
                 cursor.execute("DELETE FROM event_stalls WHERE event_id = %s", (event_id,))
                 
                 for stall in layout_details.get('stalls', []):
                     cursor.execute("""
                        INSERT INTO event_stalls 
                        (event_id, stall_name, stall_size, size_range, visibility, stall_type, price_inr, price_usd, prime_seat, prime_price_inr, prime_price_usd)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                     """, (event_id, stall.get('stallName'), stall.get('size'), stall.get('sizeRange'), stall.get('visibility'), stall.get('type'), stall.get('priceINR'), stall.get('priceUSD'), stall.get('primeSeat'), stall.get('primePriceINR'), stall.get('primePriceUSD')))

                 for am in layout_details.get('amenities', []):
                     cursor.execute("INSERT INTO stall_amenities (event_id, stall_name, amenity, qty) VALUES (%s, %s, %s, %s)", (event_id, am.get('stallName'), am.get('amenity'), am.get('qty')))

             # 4. Update Terms
             if terms_data:
                 cursor.execute("DELETE FROM event_terms WHERE event_id = %s", (event_id,))
                 for term in terms_data:
                     cursor.execute("INSERT INTO event_terms (event_id, policy_group, policy_type, policy_name) VALUES (%s,%s,%s,%s)", (event_id, term.get('policyGroup'), term.get('policyType'), term.get('policyName')))

             # 5. Update Vendors
             if vendors_data:
                 cursor.execute("DELETE FROM event_vendors WHERE event_id = %s", (event_id,))
                 cursor.execute("DELETE FROM event_sponsors WHERE event_id = %s", (event_id,))
                 cursor.execute("DELETE FROM event_guests WHERE event_id = %s", (event_id,))
                 
                 for v in vendors_data.get('vendors', []):
                     cursor.execute("INSERT INTO event_vendors (event_id, vendor_type, vendor_name, pass_count) VALUES (%s,%s,%s,%s)", (event_id, v.get('vendorType'), v.get('vendorName'), v.get('passCount', 0)))
                 for s in vendors_data.get('sponsors', []):
                     cursor.execute("INSERT INTO event_sponsors (event_id, sponsor_name, sponsorship_type) VALUES (%s,%s,%s)", (event_id, s.get('sponsorName'), s.get('sponsorship')))
                 for g in vendors_data.get('guests', []):
                     cursor.execute("INSERT INTO event_guests (event_id, guest_name, designation, contact, image) VALUES (%s,%s,%s,%s,%s)", (event_id, g.get('name'), g.get('designation'), g.get('contact'), g.get('image')))

             # 6. Handle Banner
             if 'banner' in request.files:
                 banner = request.files['banner']
                 # Logic to save and update event_files...
                 pass

             conn.commit()
             return jsonify({"success": True, "message": "Event updated successfully"})
        
        return jsonify({"error": "No eventDetails provided"}), 400

    except Exception as e:
        conn.rollback()
        print(f"Update Error: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@super_admin_bp.route("/api/abstract", methods=["GET"])
def get_abstract():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT 
                event_code,
                event_name
            FROM event_details_table
            WHERE status = 'APPROVED'
        """)

        data = cursor.fetchall()

        return jsonify(data)

    except Exception as e:
        return jsonify({"error": str(e)})

    finally:
        cursor.close()
        conn.close()
@super_admin_bp.route("/api/event-passes", methods=["GET"])
def get_event_passes():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
           SELECT 
                id,
                event_code,
                event_name,
                start_date,
                end_date
            FROM event_details_table
            WHERE status = 'APPROVED'
        """)

        data = cursor.fetchall()

        return jsonify(data)

    except Exception as e:
        return jsonify({"error": str(e)})

    finally:
        cursor.close()
        conn.close()

@super_admin_bp.route("/api/contacts", methods=["GET"])
def get_contacts():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT * FROM my_contacts ORDER BY created_at DESC")
        data = cursor.fetchall()
        
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@super_admin_bp.route("/api/contacts", methods=["POST"])
def add_contact():
    try:
        data = request.json
        print("Creating contact:", data)
        conn = get_db_connection()
        cursor = conn.cursor()

        query = """
            INSERT INTO my_contacts (
                name, email, mobile, user_type, group_name
            ) VALUES (%s, %s, %s, %s, %s)
        """
        
        cursor.execute(query, (
            data.get("name"),
            data.get("email"),
            data.get("mobile"),
            data.get("userType"),
            data.get("groupName")
        ))
        
        conn.commit()
        return jsonify({"message": "Contact created successfully"}), 201

    except Exception as e:
        print("Contact creation error:", str(e))
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@super_admin_bp.route("/api/contacts/<int:contact_id>", methods=["PUT"])
def update_contact(contact_id):
    try:
        data = request.json
        conn = get_db_connection()
        cursor = conn.cursor()

        query = """
            UPDATE my_contacts 
            SET name=%s, email=%s, mobile=%s, user_type=%s, group_name=%s
            WHERE id=%s
        """
        cursor.execute(query, (
            data.get("name"),
            data.get("email"),
            data.get("mobile"),
            data.get("userType"),
            data.get("groupName"),
            contact_id
        ))
        
        conn.commit()
        return jsonify({"message": "Contact updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@super_admin_bp.route("/api/contacts/<int:contact_id>", methods=["DELETE"])
def delete_contact(contact_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM my_contacts WHERE id=%s", (contact_id,))
        conn.commit()
        return jsonify({"message": "Contact deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@super_admin_bp.route("/api/exhibitor/bookings_details", methods=["GET"])
def get_exhibitor_bookings():
    try:
        exhibitor_id = request.args.get("exhibitor_id")

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT
                id,
                company_name,
                CONCAT(first_name, ' ', last_name) AS name,
                mobile,
                email,
                stall_area,
                products,
                address,
                status
            FROM exhibitor_stall_bookings
            ORDER BY id DESC
        """)
        data = cursor.fetchall()
        return jsonify({"data": data})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# -----------------------------------
# USER PROFILE ENDPOINTS
# -----------------------------------
# ─────────────────────────────────────────────────────────────
# GET USER PROFILE
# ─────────────────────────────────────────────────────────────
@super_admin_bp.route("/api/user/profile/<int:user_id>", methods=["GET"])
def get_profile(user_id):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT id, name, email, mobile, address, country, state, city, profile_image
            FROM users
            WHERE id = %s
        """, (user_id,))

        user = cursor.fetchone()

        if not user:
            return jsonify({
                "status": "error",
                "message": "User not found"
            }), 404

        return jsonify({
            "status": "success",
            "data": user
        })

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


# ─────────────────────────────────────────────────────────────
# UPDATE USER PROFILE
# ─────────────────────────────────────────────────────────────
@super_admin_bp.route("/api/user/update_profile", methods=["POST"])
def update_profile():
    conn = None
    cursor = None
    try:
        data = request.json
        user_id = data.get("id")

        if not user_id:
            return jsonify({
                "status": "error",
                "message": "User ID missing"
            }), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        print(f"Updating profile for user_id: {user_id}")
        
        cursor.execute("""
            UPDATE users
            SET name=%s,
                mobile=%s,
                address=%s,
                country=%s,
                state=%s,
                city=%s,
                profile_image=%s
            WHERE id=%s
        """, (
            data.get("name"),
            data.get("mobile"),
            data.get("address"),
            data.get("country"),
            data.get("state"),
            data.get("city"),
            data.get("profile_image"),
            user_id
        ))

        rows_affected = cursor.rowcount
        print(f"Rows affected: {rows_affected}")

        conn.commit()

        if rows_affected == 0:
            # Check if user exists to distinguish between "no change" and "user not found"
            cursor.execute("SELECT id FROM users WHERE id = %s", (user_id,))
            if not cursor.fetchone():
                return jsonify({
                    "status": "error",
                    "message": "User not found"
                }), 404
            
            return jsonify({
                "status": "success",
                "message": "Profile is already up to date"
            })

        return jsonify({
            "status": "success",
            "message": "Profile updated successfully"
        })

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


def get_next_complaint_code():
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT MAX(id) FROM complaint")
        result = cursor.fetchone()
        next_id = (result[0] or 0) + 1
        return f"CMP-{str(next_id).zfill(4)}"
    except Exception as e:
        print("Error generating complaint code:", e)
        return "CMP-0001"
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@super_admin_bp.route('/api/complaints', methods=['GET'])
def get_complaints():
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM complaint ORDER BY created_on DESC")
        data = cursor.fetchall()
        for row in data:
            if row.get('created_on'):
                row['created_on'] = row['created_on'].strftime('%Y-%m-%d %H:%M')
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@super_admin_bp.route('/api/approved-events', methods=['GET'])
def get_approved_events():
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, event_name FROM event_details_table WHERE status = 'APPROVED'")
        data = cursor.fetchall()
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# Create new complaint
@super_admin_bp.route('/api/complaints', methods=['POST'])
def create_complaint():
    conn = None
    cursor = None
    try:
        data = request.json
        if not data or not data.get('event_id'):
            return jsonify({'error': 'Event is required'}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Get event name
        cursor.execute("SELECT event_name FROM event_details_table WHERE id = %s", (data['event_id'],))
        event_result = cursor.fetchone()
        
        if not event_result:
            return jsonify({'error': 'Invalid event'}), 400
        
        event_name = event_result['event_name']
        complaint_code = get_next_complaint_code()
        
        # Insert complaint
        query = """
            INSERT INTO complaint (
                complaint_code, event_id, event_name,
                infrastructure_rating, amenities_rating, overall_experience_rating,
                venue_locations_rating, transportation_rating, convenience_rating,
                explanation, status
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        params = (
            complaint_code,
            data['event_id'],
            event_name,
            data.get('infrastructure_rating', 0),
            data.get('amenities_rating', 0),
            data.get('overall_experience_rating', 0),
            data.get('venue_locations_rating', 0),
            data.get('transportation_rating', 0),
            data.get('convenience_rating', 0),
            data.get('explanation', ''),
            'Active'
        )
        
        cursor.execute(query, params)
        conn.commit()
        complaint_id = cursor.lastrowid
        
        return jsonify({
            'success': True,
            'id': complaint_id,
            'complaint_code': complaint_code
        }), 201

    except Exception as e:
        print("CREATE COMPLAINT ERROR:", str(e))
        return jsonify({'error': str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
@super_admin_bp.route("/api/programs", methods=["POST"])
def create_program():
    try:
        data = request.json
        print("Creating program:", data)
        conn = get_db_connection()
        cursor = conn.cursor()

        query = """
            INSERT INTO event_programs (
                event_id, program_name, program_code, category, type, 
                start_date, end_date, venue, max_participants, budget, 
                coordinator_name, coordinator_email, description, status
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        # Handle empty date strings by converting to None correctly 
        start_date = data.get("start") if data.get("start") else None
        end_date = data.get("end") if data.get("end") else None
        max_part = data.get("maxPart") if data.get("maxPart") else 0
        budget = data.get("budget") if data.get("budget") else 0.0

        cursor.execute(query, (
            data.get("event_id"),
            data.get("name"),
            data.get("code"),
            data.get("category"),
            data.get("type"),
            start_date,
            end_date,
            data.get("venue"),
            max_part,
            budget,
            data.get("coordName"),
            data.get("coordEmail"),
            data.get("desc"),
            data.get("status", "Active")
        ))
        
        conn.commit()
        return jsonify({"message": "Program created successfully"}), 201

    except Exception as e:
        print("Program creation error:", str(e))
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()
@super_admin_bp.route('/api/program-events', methods=['GET'])
def get_program_events():
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        # Fetch events along with program counts by status
        query = """
            SELECT 
                e.id, 
                e.event_code, 
                e.event_name,
                COUNT(CASE WHEN p.status = 'Active' THEN 1 END) as approved,
                COUNT(CASE WHEN p.status = 'Inactive' THEN 1 END) as rejected,
                COUNT(CASE WHEN p.status = 'Inprocess' THEN 1 END) as inprocess,
                COUNT(p.id) as created
            FROM event_details_table e
            LEFT JOIN event_programs p ON e.id = p.event_id
            WHERE e.status = 'APPROVED'
            GROUP BY e.id
        """
        cursor.execute(query)
        data = cursor.fetchall()
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

@super_admin_bp.route('/api/program-list/<int:event_id>', methods=['GET'])
def get_programs_by_event(event_id):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM event_programs WHERE event_id = %s", (event_id,))
        data = cursor.fetchall()
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

@super_admin_bp.route('/api/complaints/<int:complaint_id>', methods=['DELETE'])
def delete_complaint(complaint_id):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM complaint WHERE id = %s", (complaint_id,))
        conn.commit()
        return jsonify({'success': True, 'message': 'Complaint deleted successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

# ── FEEDBACK ROUTES ──────────────────────────────────────────────────────────

# Get next feedback code
def get_next_feedback_code():
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute("SELECT feedback_code FROM feedback_event ORDER BY id DESC LIMIT 1")
        result = cursor.fetchone()
        if result:
            last_code = result['feedback_code']
            try:
                # Extract number from FBK-X
                parts = last_code.split('-')
                if len(parts) > 1:
                    number = int(parts[1])
                    return f"FBK-{number + 1}"
            except (ValueError, IndexError):
                pass
        return "FBK-1"
    finally:
        cursor.close()
        db.close()

# Get all feedbacks
@super_admin_bp.route('/api/feedbacks', methods=['GET'])
def get_feedbacks():
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        query = """
            SELECT
                id, feedback_code, event_id, event_name,
                status, explanation, created_at, modified_on
            FROM feedback_event
            ORDER BY id DESC
        """
        cursor.execute(query)
        feedbacks = cursor.fetchall()
        return jsonify(feedbacks or [])
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        db.close()

# Get single feedback by ID
@super_admin_bp.route('/api/feedbacks/<int:feedback_id>', methods=['GET'])
def get_feedback(feedback_id):
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM feedback_event WHERE id = %s", (feedback_id,))
        result = cursor.fetchone()
        if not result:
            return jsonify({'error': 'Feedback not found'}), 404
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        db.close()

# Create new feedback
@super_admin_bp.route('/api/feedbacks', methods=['POST'])
def create_feedback():
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        data = request.json
        if not data.get('event_id'):
            return jsonify({'error': 'Event is required'}), 400

        # Get event name
        cursor.execute("SELECT event_name FROM event_details_table WHERE id = %s", (data['event_id'],))
        event_result = cursor.fetchone()
        if not event_result:
            return jsonify({'error': 'Invalid event'}), 400

        event_name = event_result['event_name']
        feedback_code = get_next_feedback_code()

        query = """
            INSERT INTO feedback_event (
                feedback_code, event_id, event_name,
                explanation, status
            ) VALUES (%s, %s, %s, %s, 'Active')
        """
        params = (feedback_code, data['event_id'], event_name, data.get('explanation', ''))
        cursor.execute(query, params)
        db.commit()
        feedback_id = cursor.lastrowid

        return jsonify({
            'success': True,
            'id': feedback_id,
            'feedback_code': feedback_code
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        db.close()

# Update existing feedback
@super_admin_bp.route('/api/feedbacks/<int:feedback_id>', methods=['PUT'])
def update_feedback(feedback_id):
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    try:
        data = request.json
        if not data.get('event_id'):
            return jsonify({'error': 'Event is required'}), 400

        # Get event name
        cursor.execute("SELECT event_name FROM event_details_table WHERE id = %s", (data['event_id'],))
        event_result = cursor.fetchone()
        if not event_result:
            return jsonify({'error': 'Invalid event'}), 400

        event_name = event_result['event_name']

        query = """
            UPDATE feedback_event
            SET event_id    = %s,
                event_name  = %s,
                explanation = %s,
                modified_on = CURDATE()
            WHERE id = %s
        """
        params = (data['event_id'], event_name, data.get('explanation', ''), feedback_id)
        cursor.execute(query, params)
        db.commit()
        return jsonify({'success': True, 'message': 'Feedback updated'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        db.close()

# Delete feedback
@super_admin_bp.route('/api/feedbacks/<int:feedback_id>', methods=['DELETE'])
def delete_feedback(feedback_id):
    db = get_db_connection()
    cursor = db.cursor()
    try:
        cursor.execute("DELETE FROM feedback_event WHERE id = %s", (feedback_id,))
        db.commit()
        return jsonify({'success': True, 'message': 'Feedback deleted'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        db.close()
